# Ignithon 2.0 scanner integration

## Personal QR format

Ignithon now uses one personal QR per participant. There is no team QR.

The decoded QR is one unified text field:

```text
USER_IDQR_CODETEAM_ID
```

`USER_ID` is the participant's integer `roll_no`, `QR_CODE` is that participant's stored random five-character uppercase alphanumeric code, and `TEAM_ID` is the four-digit integer team ID. Example:

```text
1234567Q7M2K4321
```

The text is an identifier, not authorization. A scanner must send it to the protected backend endpoint, which validates the scanner key and confirms the roll number, Team ID, active participant, and ordered team reference against MongoDB before recording attendance.

## Attendance check-in API

```http
POST /api/ignithon/scan
Content-Type: application/json
x-ignithon-scanner-key: <IGNITHON_SCANNER_KEY>

{
  "token": "1234567Q7M2K4321",
  "scannerId": "gate-a-device-01"
}
```

Successful first scan:

```json
{
  "ok": true,
  "scanType": "participant",
  "alreadyCheckedIn": false,
  "checkedInAt": "2026-09-26T04:30:00.000Z",
  "participant": {
    "name": "Participant Name",
    "email": "participant@kiit.ac.in",
    "rollNo": 1234567,
    "role": "member"
  },
  "team": {
    "id": 4321,
    "name": "Team Name"
  }
}
```

Repeated scans return `200` with `alreadyCheckedIn: true` and preserve the original timestamp. Invalid QR text returns `400`, inactive or inconsistent registrations return `404`, invalid scanner keys return `401`, and rate-limited scanners return `429`.

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
checked_in_at: Date
checked_in_by: String
```

No unrelated MongoDB collection is read or modified.
