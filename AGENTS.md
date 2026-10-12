# Product and engineering behavior

This file is the working source of truth for Split the Bill's product behavior. Read it before changing product flows. When requirements change, update this file and the related plan in [TODO.readme](TODO.readme) in the same change. The database entities are summarized in [schema.readme](schema.readme), with field definitions in lib/schemas.

## Product purpose

Split the Bill lets a person create a shared expense for a trip, household, or recurring monthly costs. Expense members record individual purchases or services, choose who paid, and allocate each payment among the people who shared it. The same expense can have two or more members; each payment can be allocated to any non-empty subset of those members. Members can record repayments to one another as settlements.

Treat mobile web as the primary use case. People should be able to view the expense and members, add a payment, inspect balances, and record a settlement quickly on a phone. Keep primary actions easy to reach, use touch-sized controls, and make loading, empty, validation, and error states clear.

Use the Page title row for compact page-level actions: keep the title at the start, align actions at the end, and use accessible icon buttons with touch-sized hit areas on mobile. Put larger or multi-step actions in a dialog instead of crowding the page header. Keep request and interaction logic in focused hooks when it makes UI components simpler to read and maintain.

Prefer shared UI components from `components/` over raw HTML controls or one-off styling. Extend a shared component when the needed behavior or visual variant is missing, and use the shared button, input, icon-button, and dialog components in feature UI.

Keep foreground and background color pairs accessible in both light and dark themes (at least 4.5:1 contrast for normal text). Hover colors should remain within the same palette hue and darken the corresponding base color slightly.

## Domain behavior

### Accounts and membership

- A user needs an authenticated account to create an expense or join one.
- The expense creator is added as its first member.
- Membership is per expense. Access to one expense must not grant access to another expense or its data.
- A share invitation should let a recipient preview the expense name and current members, then join the expense as their authenticated account. Do not expose payment, allocation, or settlement details before the recipient has joined. Invite tokens must be unguessable and support revocation or expiry; define whether an invitation is single-use or reusable when implementing it.
- Expense invitations are reusable by multiple people for seven days. Creating a replacement revokes the previous active link; a member can also revoke the current link. Persist only a cryptographic hash of the token.
- Keep the generated invitation URL in client memory for the current page session; do not persist the token, since only its hash is stored. Keep the invitation manager state above the modal so closing and reopening the modal preserves the URL. A new page session cannot restore the URL; when the user creates a replacement, it revokes the previous active link.
- After creating an invitation, copy its join link to the creator's clipboard and show one success toast. If clipboard access fails, keep the link visible in a selectable field and clearly report that copying failed. Use a shared toast ID for invitation create and revoke feedback so only one invitation toast is visible at a time. Do not add separate copy or native-share buttons; the selectable field remains available for manual copying.
- Joining through a link must be idempotent: following the same valid invitation again must not create duplicate membership rows.
- Member add/remove and leave behavior must preserve understandable history and balances. Never silently delete past transactions when membership changes.
- The expense creator is recorded in `expense.created_by_user_id`; only that creator can remove another member. Removal is blocked if the member has any active payment, payment allocation, or settlement history. Never remove the creator or erase ledger history as part of membership changes. Existing expenses without a recorded creator must not offer removal controls.
- The expense title row includes a separate people icon that opens a member list dialog. Show names and identify the creator and current user; show removal controls only to the recorded creator.
- Keep already-loaded member rows visible during refreshes; show a loading placeholder only when no members are currently available, and render newly loaded members when the request completes.

### Expenses and payments

- Each expense has one name and one currency. A payment belongs to exactly one expense and records its total, the member who paid, and when it was recorded.
- A payment allocation records the share owed by one expense member for that payment. There may be multiple allocations covering only participants in that particular purchase; being an expense member does not mean that person shares every payment.
- Allocations for a payment must add up exactly to its total. Reject allocations to non-members, duplicate participant allocations, zero or negative shares, or a payment with no allocations. Split remainders deterministically in the smallest currency unit and show the resulting shares before save.
- Store amounts as integer minor currency units (for example, cents where the currency uses cents); never use floating-point arithmetic for balances. Respect currencies with a different minor-unit precision.
- Payment payer and allocation participants must be members of that payment's expense. Validate this on the server as well as in the UI.
- A new payment requires a short item description and an amount entered in the expense currency. The server stores the description with the payment and uses its creation timestamp as the recorded date.
- Default the payer to the current user, but allow choosing any expense member. Default the split participants to all members and let the payer select any non-empty subset.
- Split selected participants evenly in integer minor units. Assign any remainder units in stable ascending user-ID order, and preview each resulting share before saving.
- Editing or deleting a payment must update the expense balance and keep the user aware of the resulting change. A payment is an expense item; a settlement is a repayment between members.
- Track a last-read timestamp per expense member. Existing memberships start as read through the migration time; new members start as read through the time they join. In the newest-first payment ledger, show a boundary between unread and already-read payments (or after all unread payments when none have been read yet). Advance read state only when that boundary is visible, and only through the newest payment currently loaded so later payments remain unread.

### Balances and settlements

- Derive balances from the expense's payments, allocations, and settlements. Do not store a second, independently editable balance value.
- For each participant, net balance is amount paid for expense items minus their allocated shares, minus settlements they sent, plus settlements they received. A positive balance means the expense group owes that participant; a negative balance means that participant owes the group. The UI must translate this into clear person-to-person directions and amounts.
- The expense page has an accessible money-icon action that shows, for every other member, the suggested amount they owe the current user or the current user owes them. In expenses with more than two members, also show the current user's overall net position.
- A settlement records the expense, payer, payee, amount, and date. Both people must be members of that expense, payer and payee must differ, and amount must be positive and no greater than the outstanding amount in that direction.
- When the current user owes money, offer a settlement form from the balance dialog. Default the payer to the current user, default the recipient when there is only one other member, and default the amount to the full outstanding amount in that direction. Let the user choose both parties and a partial amount; use “Settling outstanding amount owed” as the default form label.
- Recording a settlement updates the displayed outstanding balances, but never modifies the underlying payments or allocations. Show payments and settlements in one newest-first ledger; identify settlements with a green left border and payer/payee/amount/date. Identify payments that put the current user in credit with a blue left border and payments that put them in debt with a red left border.
- Use exact minor-unit arithmetic and clearly label the expense currency everywhere money is displayed or entered.

### Authorization and data handling

- Require authentication for private application data and check expense membership on every expense-scoped read and write, including nested payments, allocations, settlements, and invitations.
- Return a not-found response for inaccessible expense data so endpoints do not reveal whether another user's expense exists.
- Validate request data with the existing Zod schemas and keep server-side business validation authoritative. Never trust client-supplied payer, participant, amount, or membership claims without checking them.
- Avoid exposing private account fields to expense members; display only the profile information needed to identify participants.
- Resolve member display names from the matching Neon Auth profile (`neon_auth.user`). The legacy application `user` table has a separate integer ID and must not be joined to `user_expense.user_id` for identities.
- Keep transaction creation and its allocations atomic. If a multi-row operation fails, it must not leave a partial payment or membership behind.
- Create a payment and all its participant allocations through one request and transaction. Do not expose a separate create-payment or create-allocation flow that can leave an incomplete or over-allocated payment.

## Core product flows

1. Create an account and sign in.
2. Create an expense; its creator becomes a member.
3. List expenses the signed-in user belongs to.
4. Create, preview, revoke, and use an invitation link to join an expense.
5. Add and view expense payments with payer and participant-level allocations.
6. View expense balances, including who owes whom and the remaining amount.
7. Record and view settlements.
8. Manage expense metadata and membership without corrupting transaction history.

The implementation plan and verification notes for these flows live in [TODO.readme](TODO.readme). A feature is not complete merely because an API route exists: the usable mobile web flow, access checks, validation, and meaningful success/error states are part of the feature.

## Engineering conventions

- Keep product rules in server-side services or domain helpers and reuse them from route handlers. Route presence alone is not proof that a user flow works.
- Preserve the existing Next.js App Router, TypeScript, Zod, repository/service, and API patterns unless there is a clear reason to change them.
- Keep server and first-client renders consistent when using browser-persisted state. Hydrate local storage after mount instead of reading it to determine the initial server-rendered value.
- Prefer `async`/`await` for asynchronous control flow. Avoid `.then()`/`.catch()` promise chains when the same work can be expressed clearly with `try`/`catch`/`finally`.
- Keep names and API semantics consistent with the schema: expenses contain payments; payment allocations identify who shares a payment; settlements record transfers between users.
- Document material behavior changes here and update TODO status and acceptance criteria in the same change.
- Verify changes at the level requested. Record whether a status comes from static code inspection or a runtime check; do not describe unrun checks as passing.

### Database migrations

- Add ordered SQL files under lib/db/migrations using the ####_description.sql naming pattern. Do not edit a migration after it has been applied; add a later migration instead.
- Run migrations with npm run db:migrate. The runner serializes concurrent invocations with a PostgreSQL advisory lock, applies each file in its own transaction, and stores a SHA-256 checksum in app_schema_migrations.
- Checksum mismatches and applied migration files missing from the repository stop the run. Migration SQL must be transactional; do not put explicit transaction-control statements or non-transactional DDL in migration files.
- Use npm run db:migrate:check to list pending migrations without applying them or creating the tracking table. Migrations are not applied automatically when the app starts.
