# Ignithon 2.0 scanner integration

## Personal QR format

Ignithon now uses one personal QR per participant. There is no team QR.

The decoded QR is one unified text field:

```text
PARTICIPANT_OBJECT_ID|TEAM_ID
```

`PARTICIPANT_OBJECT_ID` is the participant document's 24-character MongoDB ObjectId and `TEAM_ID` is the team's four-digit numeric `id`. Example:

```text
6aa6ff1486d1869698a45560|3766
```

The text is an identifier, not authorization. A scanner must send it to the protected backend endpoint, which validates the scanner key and confirms the participant ObjectId, Team ID, active participant, and ordered team reference against MongoDB before recording attendance.

## Attendance check-in API

```http
POST /api/ignithon/scan
Content-Type: application/json
x-ignithon-scanner-key: <IGNITHON_SCANNER_KEY>

{
  "token": "6aa6ff1486d1869698a45560|3766",
  "scannerId": "gate-a-device-01"
}
```

Successful first scan:

```json
{
  "ok": true,
  "scanType": "participant",
  "alreadyCheckedIn": false,
  "attendance": true,
  "participant": {
    "name": "Participant Name",
    "email": "participant@kiit.ac.in",
    "rollNo": "1234567",
    "role": "member"
  },
  "team": {
    "id": 4321,
    "name": "Team Name"
  }
}
```

Repeated scans return `200` with `alreadyCheckedIn: true`; attendance remains idempotent and no duplicate attendance record is created. Invalid QR text returns `400`, inactive or inconsistent registrations return `404`, invalid scanner keys return `401`, and rate-limited scanners return `429`.

The scanner must call this endpoint from a trusted backend. Never place `IGNITHON_SCANNER_KEY` in a public browser or mobile bundle.

## Registration registry

```http
GET /api/ignithon/admin/registrations
x-ignithon-admin-key: <IGNITHON_ADMIN_KEY>
```

Use `?format=csv` for the spreadsheet-compatible export. The protected visual registry is `/events/ignithon2.0/admin`. Admin keys stay in request headers and page memory; never place them in URLs or browser storage.

## Database write

The scanner updates only the matching active `ignithon-participants` document:

```text
attendance: true
updatedAt: Date
```

No unrelated MongoDB collection is read or modified.
