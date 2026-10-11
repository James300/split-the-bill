import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const description = process.argv[2]

if (
  process.argv.length !== 3 ||
  !description ||
  description.length > 120 ||
  !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(description)
) {
  console.error('Usage: npm run db:migration:new -- <lowercase_snake_case_description>')
  process.exitCode = 1
} else {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url))
  const migrationsDirectory = join(scriptDirectory, '..', 'lib', 'db', 'migrations')

  try {
    await mkdir(migrationsDirectory, { recursive: true })
    const entries = await readdir(migrationsDirectory, { withFileTypes: true })
    const sqlFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
      .map((entry) => entry.name)
    const invalidNames = sqlFiles.filter((filename) => !/^\d{4}_[a-z0-9_]+\.sql$/.test(filename))
    if (invalidNames.length > 0) {
      throw new Error(`Invalid migration filename(s): ${invalidNames.join(', ')}`)
    }

    const versions = sqlFiles.map((filename) => Number(filename.slice(0, 4)))
    if (new Set(versions).size !== versions.length) {
      throw new Error('Migration version prefixes must be unique.')
    }

    const nextVersion = Math.max(0, ...versions) + 1
    if (nextVersion > 9999) {
      throw new Error('No migration version numbers remain.')
    }

    const filename = `${String(nextVersion).padStart(4, '0')}_${description}.sql`
    const filePath = join(migrationsDirectory, filename)
    const contents = [
      `-- Created by npm run db:migration:new -- ${description}.`,
      '-- Add transactional PostgreSQL DDL below; do not include transaction-control statements.',
      '',
    ].join('\n')

    await writeFile(filePath, contents, { flag: 'wx' })
    console.log(`Created lib/db/migrations/${filename}`)
  } catch (error) {
    console.error('Failed to create database migration.')
    console.error(error)
    process.exitCode = 1
  }
}
