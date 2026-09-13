# Ignithon 2.0 scanner integration

## Purpose

Each active registration can display a QR code in the team portal. The QR contains an encrypted participant identity token. It does not contain readable names, email addresses, roll numbers, phone numbers, or Team IDs.

## Required server secrets

Configure these only in the deployment environment and `.env.local`. Never commit their values.

```text
IGNITHON_QR_SECRET=<long random secret>
IGNITHON_SCANNER_KEY=<long random scanner API key>
IGNITHON_ADMIN_KEY=<existing admin API key>
IGNITHON_ADMIN_KEYS=operations:<key>,support:<key>,event-desk:<key>
```

If `IGNITHON_QR_SECRET` is omitted, the current `IGNITHON_SESSION_SECRET` is used as the QR encryption key. A dedicated QR secret is recommended before production.

## QR payload

The decoded participant QR value has this format:

```text
K1000:IGNITHON2:<opaque-token>
```

The scanner can submit either the full decoded value or only `<opaque-token>`.

The decoded team QR is JSON so the scanner can immediately display the Team Name and Team ID:

```json
{
  "version": 1,
  "event": "ignithon-2.0",
  "type": "team",
  "teamName": "Team Name",
  "teamId": 1234,
  "token": "<encrypted-authentication-token>"
}
```

The readable `teamName` and `teamId` are display metadata only. The backend decrypts the token and verifies that both values match MongoDB before accepting the scan.

## Attendance check-in API

```http
POST /api/ignithon/scan
Content-Type: application/json
x-ignithon-scanner-key: <IGNITHON_SCANNER_KEY>

{
  "token": "K1000:IGNITHON2:<opaque-token>",
  "scannerId": "gate-a-device-01"
}
```

Successful first scan:

```json
{
  "ok": true,
  "alreadyCheckedIn": false,
  "checkedInAt": "2026-08-08T04:30:00.000Z",
  "participant": {
    "name": "Participant Name",
    "email": "participant@kiit.ac.in",
    "rollNo": 1234567,
    "role": "member"
  },
  "team": {
    "id": 1234,
    "name": "Team Name"
  }
}
```

Repeated scans return `200` with `alreadyCheckedIn: true` and preserve the original check-in timestamp. Invalid QR values return `400`, inactive registrations return `404`, invalid scanner keys return `401`, and rate-limited scanners return `429`.

For a team QR, send the complete decoded JSON string in the same `token` field. A successful response uses `scanType: "team"`, writes `checked_in_at` and `checked_in_by` to the `ignithon-teams` record, and returns the authenticated team plus its active participant list. Participant QR responses use `scanType: "participant"` and write attendance to that participant record.

The scanner must send this request from its trusted backend. Do not put `IGNITHON_SCANNER_KEY` in a public browser or mobile bundle.

## Registration registry API

JSON registry:

```http
GET /api/ignithon/admin/registrations
x-ignithon-admin-key: <IGNITHON_ADMIN_KEY>
```

Spreadsheet-compatible CSV:

```http
GET /api/ignithon/admin/registrations?format=csv
x-ignithon-admin-key: <IGNITHON_ADMIN_KEY>
```

The protected visual registry is available at `/events/ignithon2.0/admin`. The admin key is held only in the page's memory and is sent in the request header; it is not placed in the URL or local storage.

`IGNITHON_ADMIN_KEYS` supports multiple comma-separated `name:key` entries. Each person or operational group should receive a different value. Remove one entry to revoke that person's access without rotating every administrator. The legacy `IGNITHON_ADMIN_KEY` remains accepted for backward compatibility.

The CSV includes team ID/name/points, participant role and status, contact and academic fields, hostel/day-boarder status, check-in metadata, and removal timestamp. It opens directly in Excel, Google Sheets, Numbers, and LibreOffice Calc.

## Database writes

The scanner updates the matching active document in `ignithon-participants` with:

```text
checked_in_at: Date
checked_in_by: String
```

No unrelated MongoDB collections are read or modified.
