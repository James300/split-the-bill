import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'
import { Pool } from '@neondatabase/serverless'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is required to run database migrations.')
  process.exitCode = 1
} else {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url))
  const migrationsDirectory = join(scriptDirectory, '..', 'lib', 'db', 'migrations')
  const dryRun = process.argv.includes('--dry-run')
  const pool = new Pool({ connectionString, max: 1 })
  let client
  let lockAcquired = false

  try {
    client = await pool.connect()
    await client.query(
      "SELECT pg_advisory_lock(hashtext('split-the-bill:schema-migrations')::bigint)",
    )
    lockAcquired = true

    const ledgerResult = await client.query(
      "SELECT to_regclass('app_schema_migrations') IS NOT NULL AS exists",
    )
    let ledgerExists = ledgerResult.rows[0].exists

    if (!dryRun && !ledgerExists) {
      await client.query(`
        CREATE TABLE app_schema_migrations (
          filename TEXT PRIMARY KEY,
          checksum CHAR(64) NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      ledgerExists = true
    }

    const migrationEntries = await readdir(migrationsDirectory, { withFileTypes: true })
    const sqlFiles = migrationEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
      .map((entry) => entry.name)
      .sort()

    const invalidNames = sqlFiles.filter((filename) => !/^\d{4}_[a-z0-9_]+\.sql$/.test(filename))
    if (invalidNames.length > 0) {
      throw new Error(`Invalid migration filename(s): ${invalidNames.join(', ')}`)
    }

    const versionPrefixes = sqlFiles.map((filename) => filename.slice(0, 4))
    if (new Set(versionPrefixes).size !== versionPrefixes.length) {
      throw new Error('Migration version prefixes must be unique.')
    }

    const appliedResult = ledgerExists
      ? await client.query('SELECT filename, checksum FROM app_schema_migrations ORDER BY filename')
      : { rows: [] }
    const appliedMigrations = new Map(appliedResult.rows.map((row) => [row.filename, row.checksum.trim()]))
    const checkedInMigrations = new Set(sqlFiles)
    const missingAppliedFiles = [...appliedMigrations.keys()].filter(
      (filename) => !checkedInMigrations.has(filename),
    )
    if (missingAppliedFiles.length > 0) {
      throw new Error(
        `Applied migration file(s) are missing from the repository: ${missingAppliedFiles.join(', ')}`,
      )
    }
    const pending = []

    for (const filename of sqlFiles) {
      const contents = await readFile(join(migrationsDirectory, filename), 'utf8')
      if (!contents.trim()) {
        throw new Error(`Migration ${filename} is empty.`)
      }

      const checksum = createHash('sha256').update(contents).digest('hex')
      const existingChecksum = appliedMigrations.get(filename)
      if (existingChecksum && existingChecksum !== checksum) {
        throw new Error(
          `Applied migration ${filename} has changed. Restore its original contents and add a new migration instead.`,
        )
      }
      if (!existingChecksum) pending.push({ filename, contents, checksum })
    }

    if (dryRun) {
      if (pending.length === 0) {
        console.log('No pending database migrations.')
      } else {
        console.log('Pending database migrations:')
        for (const migration of pending) console.log(`- ${migration.filename}`)
      }
    } else {
      for (const migration of pending) {
        await client.query('BEGIN')
        try {
          await client.query(migration.contents)
          await client.query(
            'INSERT INTO app_schema_migrations (filename, checksum) VALUES ($1, $2)',
            [migration.filename, migration.checksum],
          )
          await client.query('COMMIT')
          console.log(`Applied ${migration.filename}`)
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        }
      }

      if (pending.length === 0) {
        console.log('No pending database migrations.')
      }
    }
  } catch (error) {
    console.error('Database migration failed.')
    console.error(error instanceof Error ? error.message : 'Unexpected migration error.')
    process.exitCode = 1
  } finally {
    if (client && lockAcquired) {
      try {
        await client.query(
          "SELECT pg_advisory_unlock(hashtext('split-the-bill:schema-migrations')::bigint)",
        )
      } catch {
        // Releasing the connection also releases its advisory lock.
      }
    }
    client?.release()
    await pool.end()
  }
}
