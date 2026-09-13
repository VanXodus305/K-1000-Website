# Ignithon 2.0 technical handover

## LLM continuation contract — read this first

This section is the normative contract for any LLM or developer continuing the Ignithon system. Statements using **MUST**, **MUST NOT**, **SHOULD**, and **SHOULD NOT** describe implementation constraints, not suggestions.

### Scope and ownership

- The Ignithon feature owns only the MongoDB collections `ignithon-teams` and `ignithon-participants`.
- An LLM **MUST NOT** rename, drop, truncate, migrate, or bulk-rewrite any collection without explicit user authorization and a recoverable migration plan.
- An LLM **MUST NOT** query or modify unrelated collections in the configured database.
- Existing historical event data **MUST** remain intact. Ignithon 2.0 is an additional event and registration system.
- Secrets **MUST NOT** be written into source code, Markdown, logs, browser URLs, Git commits, or client-side bundles.
- `.env.local` is the local secret source and is Git-ignored. Deployment secrets belong in the hosting provider's environment configuration.
- After changing an environment value, restart the Next.js process because server modules may have captured environment values when loaded.

### Source-of-truth hierarchy

When documentation and code disagree, inspect these files before changing behavior:

1. `src/lib/ignithon-types.ts` — persisted TypeScript shapes.
2. `src/lib/ignithon-db.ts` — collection names, indexes, serialization, and shared queries.
3. `src/lib/mongodb.ts` — connection lifecycle and database selection.
4. `src/lib/ignithon-auth.ts` — session signing and registration-identity rules.
5. `src/lib/ignithon-qr.ts` — encrypted QR contracts.
6. `src/app/api/ignithon/**/route.ts` — authorization, validation, and writes.
7. This handover — intended product invariants and operational constraints.

If the implementation violates a stated business invariant, treat that as a defect; do not silently redefine the invariant to match the defect.

## Backend-to-database connection contract

### Connection lifecycle

`src/lib/mongodb.ts` is the only MongoDB connection entry point.

1. Read `MONGODB_URI` from the server environment.
2. Read `MONGODB_DB`; default to `k1000` when it is absent.
3. Create one `MongoClient(uri).connect()` promise.
4. Cache that promise in `global.__k1000MongoClientPromise` so development hot reloads and repeated API calls reuse the same client.
5. Return `client.db(dbName)` from `getMongoDb()`.
6. Throw `MONGODB_URI is not configured` if no URI exists.

An LLM **MUST** use `getMongoDb()` or `getIgnithonCollections()` and **MUST NOT** create a new Mongo client inside individual routes. Do not place database code in client components. All modules importing `node:crypto` or `mongodb` must remain server-only.

`GET /api/ignithon/health` runs `{ ping: 1 }` against the selected database. It returns `200` with `{ ok: true, database }` when connected and `503` with a generic error when unavailable. It must not expose the URI, credentials, host topology, or raw driver error.

### Collection accessor and indexes

Every Ignithon route obtains collections through `getIgnithonCollections()`:

```text
teams        = db.collection("ignithon-teams")
participants = db.collection("ignithon-participants")
```

The accessor idempotently requests these indexes:

```text
ignithon-teams.id                  unique  unique_team_id
ignithon-participants.roll_no      unique  unique_participant_roll_no
ignithon-participants.email        unique  unique_participant_email
ignithon-participants.team_id,
  ignithon-participants.status     normal  team_members
```

Consequences an LLM must preserve:

- Team IDs are globally unique within `ignithon-teams`.
- Roll numbers are globally unique across active and removed participant documents.
- Emails are normalized to lowercase before insertion and globally unique across active and removed documents.
- A removed participant is reactivated by updating the existing document; do not insert a second document with the same email or roll number.
- MongoDB `_id` values are internal implementation details and must not be exposed in public or admin responses.

### Cross-collection invariant

Membership is intentionally represented twice:

```text
ignithon-teams.members[]                 -> { email, role }
ignithon-participants.team_id + status  -> team membership record
```

For every active participant:

1. There **MUST** be exactly one participant document with `status: "ACTIVE"`.
2. Its `team_id` **MUST** reference one existing team.
3. That team's `members` array **MUST** contain the participant's normalized email exactly once.
4. Exactly one member reference per team **MUST** have `role: "leader"`.
5. The leader must also exist as an active participant document for the same Team ID.

Any future write path that changes membership **MUST** update both collections. Reads of the portal use active participant documents; authorization roles come from `team.members`. Do not infer the leader from participant sort order or array position. Find the member reference whose role is `leader`.

### Write protocols

#### Create a team

1. Rate-limit by requester IP: 10 attempts per 60-second in-memory window.
2. Validate team name and all leader fields.
3. Normalize the leader email.
4. Reject an existing email or roll number. If that active record is already the leader of its team, reopen that team instead of creating a duplicate.
5. A person previously registered as a member must never create a new team as its leader, including after removal. The only supported promotion path is an authorized leadership transfer inside that person's current active team.
6. Generate a random integer from 1000 through 9999; check for collision; retry at most 30 times.
7. Insert the team first with one leader reference and zero points.
8. Insert the leader participant as active.
9. If leader insertion fails, delete only the just-created team as compensating rollback.
10. Issue the signed leader session only after both inserts succeed.

#### Add a member

1. Require a valid session for the same Team ID with role `leader`.
2. Rate-limit by leader email: 20 attempts per 60-second in-memory window.
3. Validate and normalize all participant fields.
4. Count active participant documents; reject when the count is already four, including the leader.
5. Reject any active record matching either email or roll number.
6. If a removed record exists, require at least five minutes since `removed_at`.
7. Reactivate the existing participant document when present; otherwise insert a new document.
8. Push one `{ email, role: "member" }` reference into the team.

This operation currently uses two writes without a MongoDB transaction. A future LLM should prefer a transaction when the deployment topology supports transactions, or implement an explicit compensating rollback. Never add retry logic that can push duplicate member references.

#### Remove a member

1. Require a valid leader session for the same Team ID.
2. Reject attempts to remove the member reference whose role is `leader`.
3. Set participant `status` to `REMOVED` and `removed_at` to the current server time.
4. Pull that email from the team's member array.
5. Keep the participant document so uniqueness, history, and cooling-period enforcement remain possible.

This also uses two writes without a transaction. If one write fails, inspect and repair the cross-collection invariant before retrying.

#### Edit participant details

- A leader may edit any active participant in their own team.
- A member may edit only the participant whose email equals the signed session email.
- Editable fields are only `name`, `phone`, `branch`, `year`, and `hostel`.
- Email, roll number, Team ID, status, role, QR identity, check-in fields, and removal fields are not editable through this endpoint.
- Trim string updates, convert blank hostel to `null`, and require year to be an integer from 1 through 6.

#### Transfer team leadership

1. Require a valid session for the same Team ID with role `leader`.
2. Rate-limit by the current leader email: 10 attempts per 60-second in-memory window.
3. Accept only the normalized email of another active participant in the same team whose current role is `member`.
4. Replace the team's complete role assignment atomically so the selected member is the sole `leader` and every other roster entry is a `member`.
5. Include the current leader identity in the update filter so concurrent or stale transfers fail with `409`.
6. Immediately replace the initiating user's signed session with a member session. The promoted leader obtains leader permissions on their next login; server authorization must always derive their current role from the team record.
7. Do not modify either participant document during a transfer. Participant identity and Team ID remain unchanged; only `ignithon-teams.members[].role` changes.

#### Check in by QR

- Require `x-ignithon-scanner-key` to match `IGNITHON_SCANNER_KEY` using timing-safe comparison.
- Rate-limit by scanner IP: 120 requests per 60-second in-memory window.
- Never trust readable QR metadata by itself.
- Decrypt and authenticate the QR token, then query the live team or active participant.
- Team QR: match both token Team ID and token Team Name to MongoDB, then set team `checked_in_at` and `checked_in_by`.
- Participant QR: match token Team ID and normalized token email to an active participant, then set participant check-in fields.
- Preserve the first check-in timestamp. Repeated scans return `alreadyCheckedIn: true` and must not create another record.
- Limit supplied `scannerId` to 80 characters; default to `scanner`.

### Input and identity rules

- Team IDs are integers from 1000 through 9999.
- Years are integers from 1 through 6.
- Roll numbers are positive integers.
- Emails are trimmed and lowercased before persistence or comparison.
- KIIT students must use an email ending in `@kiit.ac.in`.
- For a KIIT student, the numeric email local part must equal `roll_no`; for example, roll `12345` requires `12345@kiit.ac.in`.
- Non-KIIT participants may use a syntactically valid normal email and provide their college roll/ID number separately.
- Blank hostel means day boarder and is stored as `null`, not an empty string.
- Team size is four people total: one leader plus at most three members.

### Authentication trust boundaries

#### Portal session

The `ignithon_session` cookie contains base64url-encoded JSON with email, Team ID, role, and expiry, followed by an HMAC-SHA256 signature. It is signed, not encrypted; never put additional private data in it.

The server must verify the signature using timing-safe comparison and reject expired or malformed payloads. Cookie properties are HTTP-only, SameSite=Lax, path `/`, secure in production, and 30-day maximum age.

Returning login accepts only roll number plus Team ID. The server looks up an active participant and derives email and role from MongoDB before signing the session. Never accept a client-supplied role or email as authoritative during login.

The client-readable `ignithon_returning_identity` cookie stores only roll number and Team ID for form prefill. It survives logout for 180 days but grants no server authorization. Logout clears `ignithon_session`; it does not clear the remembered identity.

#### Admin access

- Admin requests use `x-ignithon-admin-key`.
- `IGNITHON_ADMIN_KEYS` is a comma-separated list of `name:key` entries.
- `IGNITHON_ADMIN_KEY` remains a legacy compatible key.
- Compare key values with timing-safe comparison.
- The named operations, support, and event-desk keys currently have identical technical access to both admin endpoints. Their names are distribution/revocation labels, not RBAC scopes.
- Never store an admin key in local storage, query strings, CSV files, or repository documentation.

#### Scanner access

- Scanner requests use `x-ignithon-scanner-key`.
- The scanner key has no access to admin endpoints.
- The scanner developer must call the scan endpoint from a trusted backend. Never embed the scanner key in a public JavaScript or mobile application bundle.

### QR cryptography contract

- Derive a 256-bit key by SHA-256 hashing `IGNITHON_QR_SECRET`; fall back to `IGNITHON_SESSION_SECRET` only when the dedicated secret is missing.
- Encrypt payload JSON with AES-256-GCM and a fresh random 12-byte IV.
- Token structure is `version.iv.ciphertext.authenticationTag`, with binary parts encoded as base64url.
- Current token version is `1` and event identifier is `ignithon-2.0`.
- Participant payload contains `kind`, event, Team ID, and normalized email.
- Team payload contains `kind`, event, Team ID, and Team Name.
- Rotating the QR secret invalidates every previously rendered QR.
- QR SVG responses are private and `no-store`.
- Participant QR generation requires leader access or the same participant session.
- Team QR generation requires any valid session for that team.

### Serialization and data exposure

- Convert MongoDB `Date` values to ISO-8601 strings at API boundaries.
- Portal responses may contain only the requesting team's active participants.
- Admin JSON/CSV may contain registration PII only after admin-key validation.
- Scanner responses may contain the authenticated participant/team details only after scanner-key and QR-token validation.
- Errors returned to clients must be generic. Raw Mongo errors, stack traces, secrets, and connection details belong only in protected server diagnostics.
- Set admin registry and QR responses to private/no-store.

### Rate-limit limitation

`src/lib/ignithon-rate-limit.ts` stores counters in an in-memory `Map`. This is adequate for local development but is neither shared across server instances nor durable across restarts. Before production scale-out, replace it with a shared TTL-backed limiter such as Redis. Preserve the current route-specific limits unless the event team approves different values.

### Failure and consistency rules

- Validate authorization before reading or writing private records.
- Validate request data before opening a write sequence.
- Use explicit filters containing Team ID, normalized identity, and `status: "ACTIVE"` where relevant.
- Treat duplicate-key errors as expected conflict paths and return `409`, not a generic `500`, when adding robust error mapping later.
- Prefer MongoDB transactions for operations touching both collections.
- If transactions are unavailable, use compensating rollback and log enough non-secret identifiers to repair consistency.
- Do not silently delete malformed or orphaned records. Report and repair them through an explicit admin operation.
- Attendance scans must remain idempotent under retries and poor network conditions.

### LLM safe-change checklist

Before editing:

1. Read this complete document and the source-of-truth files listed above.
2. Inspect `git status`; preserve unrelated user changes in the dirty worktree.
3. Confirm that `.env.local` remains ignored and never print secret values.
4. Identify which collection, route, session role, and invariant the change affects.

After editing:

1. Run TypeScript, focused ESLint, and the production build.
2. Test leader and member permissions separately.
3. Test invalid authorization as well as successful authorization.
4. For multi-document writes, verify both collections agree afterward.
5. Test duplicate registration, maximum team size, cooling period, logout, remembered login, QR replay, and CSV export when those paths were touched.
6. Do not create or mutate real participant records merely to test UI unless the user explicitly authorizes test data.

### Never-do list for an LLM

- Never expose `MONGODB_URI`, session secrets, QR secrets, admin codes, or scanner codes.
- Never trust role, Team Name, Team ID, email, or attendance status solely because it came from the browser or QR's readable metadata.
- Never use a four-digit Team ID alone as authorization.
- Never allow a member session to edit another participant.
- Never allow a leader to be removed or duplicated.
- Never insert a new participant document when a reusable removed record already owns that email or roll number.
- Never exceed one leader plus three members.
- Never make admin data public to simplify the admin UI.
- Never put scanner credentials into frontend code.
- Never change or inspect unrelated MongoDB collections.
- Never run destructive database cleanup, index deletion, or bulk migration without explicit approval and a backup plan.

## Concrete API data contracts

All write requests use `Content-Type: application/json`. Examples omit optional fields only where the route allows omission.

### Create team and leader

```http
POST /api/ignithon/teams

{
  "name": "Team Name",
  "leader": {
    "name": "Leader Name",
    "email": "1234567@kiit.ac.in",
    "is_kiit_student": true,
    "roll_no": 1234567,
    "hostel": "KP-10",
    "phone": "9999999999",
    "branch": "Computer Science & Engineering",
    "year": 3
  }
}
```

New team response: `201 { "teamId": 1234 }`. Existing leader response: `200 { "teamId": 1234, "existing": true }`. Validation returns `400`, conflicts return `409`, and rate limiting returns `429`.

### Returning login

```http
POST /api/ignithon/session

{
  "rollNo": 1234567,
  "teamId": 1234
}
```

Success returns `200 { "teamId": 1234, "role": "leader" | "member" }` and sets `ignithon_session`. Invalid field shapes return `400`; no matching active membership returns `401`; rate limiting returns `429`.

### Load portal

```http
GET /api/ignithon/teams/1234
Cookie: ignithon_session=...
```

Success returns `{ team, participants, session }`. `participants` contains only active members. A missing or cross-team session returns `401`.

### Add participant

```http
POST /api/ignithon/teams/1234/participants
Cookie: ignithon_session=...

{
  "name": "Member Name",
  "email": "member@example.com",
  "is_kiit_student": false,
  "roll_no": 7654321,
  "hostel": null,
  "phone": "9999999999",
  "branch": "Other",
  "year": 2
}
```

Success returns `201 { participant }`. Non-leaders return `403`; invalid input returns `400`; full team, duplicates, or cooling period return `409`; rate limiting returns `429`.

### Edit participant

```http
PATCH /api/ignithon/teams/1234/participants/member%40example.com
Cookie: ignithon_session=...

{
  "name": "Updated Name",
  "phone": "9999999999",
  "branch": "Information Technology",
  "year": 3,
  "hostel": null
}
```

Unknown fields are discarded. Success returns `200 { "ok": true }`; forbidden edits return `403`; missing active records return `404`.

### Transfer leadership

```http
PATCH /api/ignithon/teams/1234/leader
Cookie: ignithon_session=...

{
  "email": "member@example.com"
}
```

Success returns `200 { "ok": true, "previousLeader": "old@example.com", "leader": "member@example.com" }`. The caller's session is immediately downgraded to `member`. Non-leaders return `403`; invalid targets return `400` or `404`; stale or ineligible transfers return `409`; rate limiting returns `429`.

### Remove participant

```http
DELETE /api/ignithon/teams/1234/participants/member%40example.com
Cookie: ignithon_session=...
```

Success returns `200 { "ok": true, "coolingPeriodSeconds": 300 }`. Non-leaders return `403`; leader-removal attempts return `409`.

### QR images

```http
GET /api/ignithon/teams/1234/qr
GET /api/ignithon/teams/1234/participants/member%40example.com/qr
Cookie: ignithon_session=...
```

Success is an SVG response with `Content-Type: image/svg+xml` and `Cache-Control: private, no-store`. Authorization rules are described above.

### Scanner check-in

```http
POST /api/ignithon/scan
x-ignithon-scanner-key: <server-side scanner key>

{
  "token": "<complete decoded QR value or opaque token>",
  "scannerId": "gate-a-device-01"
}
```

Success returns `scanType`, `alreadyCheckedIn`, `checkedInAt`, authenticated team details, and participant details where appropriate. See the scanner integration document for full examples.

### Admin reads and export

```http
GET /api/ignithon/admin/registrations
GET /api/ignithon/admin/registrations?format=csv
GET /api/ignithon/admin/team-leaders
x-ignithon-admin-key: <one configured admin code>
```

Missing or invalid keys return `401`. JSON and CSV responses are generated from both owned collections and exclude MongoDB `_id` fields. CSV output quotes every cell and escapes embedded quotation marks.

## Current release

- Event dates: 26th and 27th September 2026
- Public event route: `/events/ignithon2.0`
- Protected registry: `/events/ignithon2.0/admin`
- Database: MongoDB, selected through `MONGODB_URI` and optional `MONGODB_DB`
- Runtime: Next.js App Router server routes on the Node.js runtime

This document intentionally contains no secret values. Local development values live in `.env.local`; production values must be configured in the deployment environment.

## Registration model

### `ignithon-teams`

```text
id: Integer, unique four-digit Team ID
name: String
members: [{ email: String, role: "leader" | "member" }]
points: Integer
checked_in_at?: Date
checked_in_by?: String
```

### `ignithon-participants`

```text
name: String
email: String, unique
is_kiit_student: Boolean
roll_no: Integer, unique
team_id: Integer
hostel: String | null
phone: String
branch: String
year: Integer
status: "ACTIVE" | "REMOVED"
removed_at?: Date
checked_in_at?: Date
checked_in_by?: String
```

The application creates unique indexes for Team ID, participant roll number, and participant email. It also creates a team/status lookup index.

## Business rules

- A team contains one leader and up to three members.
- A leader cannot lead multiple teams or join another team as a member. A member cannot create a new team as leader, but can be promoted within their current team by its current leader.
- A participant can belong to only one active team.
- Only the leader can add/remove members and edit every card.
- A participant can log in and edit only their own card.
- Removed members have a five-minute cooling period before another team can add them.
- The historical Ignithon event remains separate from Ignithon 2.0.

## Authentication and remembered login

Returning users authenticate with their unique roll number plus four-digit Team ID. The server resolves the participant's email and role from MongoDB before creating the session.

- `ignithon_session`: signed, HTTP-only, SameSite=Lax authentication cookie; 30-day lifetime.
- `ignithon_returning_identity`: remembers roll number and Team ID for 180 days and survives logout. It only prefills the login form and cannot authenticate a request.
- `ignithon-team-id`: local-storage convenience value used to reopen a portal while the signed server session remains valid. It is removed on logout.

Logout clears only the authenticated session and local portal pointer. The remembered identity remains available for the next login.

Important: roll number plus a four-digit Team ID is a convenience-level identity check, not strong authentication. Add email OTP or institutional SSO before exposing higher-risk actions or data.

## API routes

| Method | Route | Purpose | Authorization |
|---|---|---|---|
| `GET` | `/api/ignithon/health` | MongoDB health check | Public |
| `POST` | `/api/ignithon/teams` | Create leader and team | Rate limited |
| `GET` | `/api/ignithon/teams/{teamId}` | Load team portal | Team session |
| `PATCH` | `/api/ignithon/teams/{teamId}/leader` | Transfer leadership to an active member | Leader session |
| `POST` | `/api/ignithon/teams/{teamId}/participants` | Add member | Leader session |
| `PATCH` | `/api/ignithon/teams/{teamId}/participants/{email}` | Edit participant | Leader or same participant |
| `DELETE` | `/api/ignithon/teams/{teamId}/participants/{email}` | Remove member | Leader session |
| `POST` | `/api/ignithon/session` | Login with roll number and Team ID | Rate limited |
| `POST` | `/api/ignithon/session/logout` | Clear authenticated session | Current session |
| `GET` | `/api/ignithon/teams/{teamId}/qr` | Render encrypted team QR | Team session |
| `GET` | `/api/ignithon/teams/{teamId}/participants/{email}/qr` | Render participant QR | Leader or same participant |
| `POST` | `/api/ignithon/scan` | Verify QR and record check-in | Scanner key |
| `GET` | `/api/ignithon/admin/registrations` | Full JSON registry | Admin key |
| `GET` | `/api/ignithon/admin/registrations?format=csv` | Spreadsheet export | Admin key |
| `GET` | `/api/ignithon/admin/team-leaders` | Support directory | Admin key |

See `docs/ignithon-scanner-integration.md` for the QR payload and scanner request/response contract.

## Access-code roles

- `operations`: registration registry and CSV access for core operations.
- `support`: registry access for participant and team support.
- `event-desk`: registry access for on-site registration staff.
- Scanner key: accepted only by the scan endpoint; it cannot open the admin registry.

The three named admin codes currently have the same technical permissions. Their separate names allow independent distribution and revocation. Remove a `name:key` entry from `IGNITHON_ADMIN_KEYS` to revoke it. The legacy `IGNITHON_ADMIN_KEY` is still accepted for compatibility.

## Environment variables

```text
MONGODB_URI                  required
MONGODB_DB                   optional; defaults to k1000
IGNITHON_SESSION_SECRET      required
IGNITHON_QR_SECRET           recommended; falls back to session secret
IGNITHON_ADMIN_KEY           legacy admin key
IGNITHON_ADMIN_KEYS          comma-separated name:key entries
IGNITHON_SCANNER_KEY         required for scanner writes
```

Never commit `.env.local`. The repository ignores all `.env*` files.

## QR and attendance

- Participant QRs contain an encrypted registration token and no readable personal data.
- Team QRs contain readable Team Name and Team ID for scanner display plus an encrypted authentication token.
- The backend trusts only the decrypted token and live MongoDB record, never the readable QR metadata.
- First scan records `checked_in_at` and `checked_in_by`.
- Repeated scans are idempotent and return the original check-in timestamp.
- Scanner requests are API-key protected and rate limited.

## Admin registry

The admin screen fetches live MongoDB data after an admin code is entered. Teams are primary expandable nodes with a leader branch and member branches. CSV export remains a flat row format for Excel, Google Sheets, Numbers, and LibreOffice.

Admin codes stay in page memory only. They are not placed in the URL or local storage.

## Main implementation files

- `src/app/events/ignithon2.0/page.tsx` — registration and team portal UI
- `src/app/events/ignithon2.0/admin/page.tsx` — protected hierarchical registry
- `src/app/api/ignithon/` — registration, session, QR, scanner, and admin APIs
- `src/lib/ignithon-db.ts` — collection and index setup
- `src/lib/ignithon-types.ts` — persisted data contracts
- `src/lib/ignithon-auth.ts` — signed session cookies
- `src/lib/ignithon-qr.ts` — encrypted QR payloads
- `src/lib/ignithon-api-key.ts` — admin/scanner key comparison
- `src/lib/ignithon-rate-limit.ts` — local request throttling

## Verification and deployment

Run before handover or deployment:

```bash
npx tsc --noEmit
npx eslint src/app/events/ignithon2.0 src/app/api/ignithon src/lib/ignithon-*.ts
npm run build
```

After deployment:

1. Confirm `/api/ignithon/health` returns `200`.
2. Create or use a test team and verify roll-number login.
3. Verify leader and member edit permissions separately.
4. Generate participant and team QRs.
5. Scan against a non-production test record before event-day usage.
6. Open the admin registry and download the CSV.
7. Confirm secrets are present in the deployment environment and absent from Git history.

## Known follow-up

The dependency audit currently reports security advisories against the project's pinned Next.js `16.1.1`. Upgrade Next.js through a separate compatibility-tested change before production deployment.
