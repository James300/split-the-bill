# Split the Bill

Split the Bill helps people track shared costs for an occasion, such as a trip, household, or monthly budget. Create an expense, add the people involved, record each purchase or service, choose who paid and which members share that cost, then record repayments between members.

The experience is designed for phones first: people should be able to add a cost, check balances, and record a settlement quickly while away from a desktop.

## How expense sharing works

- An expense has a name and one currency, and its creator is its first member.
- Members join an expense and can see its name and participant list.
- Each payment records its total and the member who paid. Its allocations record how much each participant owes for that payment. The allocation list can contain any subset of expense members, so a meal can be split between two people even when four people belong to the trip.
- A settlement records money one member paid to another. Settlements reduce the outstanding balances; they do not change the original payment history.
- Balances are calculated from payments, allocations, and settlements for the expense.

See [AGENTS.md](AGENTS.md) for the product behavior and implementation conventions that guide future changes. See [TODO.readme](TODO.readme) for the feature plan and current code-review status.

## Current implementation

The project includes email and Google authentication flows, expense creation and member listing, seven-day share invitations, a payment ledger with per-member unread tracking, payment and payment-allocation APIs, expense balance calculation, and settlement APIs. Invite links can be replaced or revoked from the expense share dialog; recipients can preview an expense and its members, authenticate, and join. Apply pending database migrations with the migration runner before using new schema-backed features. The TODO tracks remaining UI gaps and flows that still need runtime verification.

The database model is summarized in [schema.readme](schema.readme); detailed schema definitions live in [lib/schemas](lib/schemas).

## Run locally

Requirements: Node.js and npm, plus a configured Neon database and Neon Auth application.

1. Install dependencies with npm install.
2. Configure the environment values used by lib/db and lib/auth/server.ts for your local Neon database and Neon Auth application.
3. Review pending SQL files with npm run db:migrate:check, then apply them with npm run db:migrate.
4. Start the development server with npm run dev.
5. Open http://localhost:3000.

Useful scripts:

- npm run dev starts the local development server.
- npm run build creates a production build.
- npm run start serves a production build.
- npm run lint runs ESLint.
- npm run db:migrate:check lists pending database migrations.
- npm run db:migrate applies pending database migrations safely.

## Stack

- Next.js App Router with React and TypeScript
- Neon Postgres and Neon Auth
- Tailwind CSS with Radix UI components
