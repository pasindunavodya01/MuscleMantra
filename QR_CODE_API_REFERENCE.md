# QR Code Attendance API Reference

## Admin Endpoints

### Generate QR Code
```
POST /admin/qrcode/generate

Response:
{
  "qrCode": {
    "id": "ObjectId",
    "code": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "New QR code generated successfully"
}
```

### Get Active QR Code
```
GET /admin/qrcode/active

Response:
{
  "qrCode": {
    "id": "ObjectId",
    "code": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": true
  }
}

Error (if no active code):
{
  "message": "No active QR code"
}
```

### Deactivate QR Code
```
DELETE /admin/qrcode/{id}

Response:
{
  "message": "QR code deactivated"
}
```

### Get QR Code History
```
GET /admin/qrcode/history

Response:
{
  "history": [
    {
      "_id": "ObjectId",
      "code": "550e8400-e29b-41d4-a716-446655440000",
      "isActive": false,
      "createdAt": "2026-03-12T10:00:00Z",
      "scannedBy": [
        {
          "_id": "ObjectId",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ]
    }
  ]
}
```

## Member Endpoints

### Check In Attendance
```
POST /member/attendance/checkin

Request Body:
{
  "qrCode": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "attendance": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "checkInTime": "2026-03-12T10:30:00Z",
    "date": "2026-03-12"
  },
  "message": "Check-in successful"
}

Errors:
{
  "message": "Invalid or inactive QR code"
}

{
  "message": "Already checked in today"
}
```

## Public Endpoints (No Auth Required)

### Get Current Active QR Code
```
GET /api/qrcode/current

Response:
{
  "qrCode": {
    "id": "ObjectId",
    "code": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": true
  }
}

Error:
{
  "message": "No active QR code available"
}
```

### Handle External QR Scanner
```
GET /api/qrcode/scan?code=550e8400-e29b-41d4-a716-446655440000

Response (if valid):
{
  "success": true,
  "code": "550e8400-e29b-41d4-a716-446655440000"
}

Error (if invalid):
{
  "message": "Invalid or expired QR code"
}
```

## Frontend Usage

### Get QR Code for Display (Admin)
```javascript
const response = await api.get("/admin/qrcode/active");
const qrCode = response.data.qrCode.code;
// Generate image: https://api.qrserver.com/v1/create-qr-code/?data={URL}
```

### Generate New QR Code (Admin)
```javascript
const response = await api.post("/admin/qrcode/generate");
const qrCode = response.data.qrCode.code;
```

### Check In (Member)
```javascript
const response = await api.post("/member/attendance/checkin", {
  qrCode: "550e8400-e29b-41d4-a716-446655440000"
});
// Check response.data.message for success
```

### Detect QR from URL (Both)
```javascript
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
if (code) {
  // Use code for check-in or redirect flow
}
```

## QR Code Image Generation

The frontend uses an external API to generate QR code images:

```javascript
const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
  `${window.location.origin}/api/qrcode/scan?code=${code}`
)}`;

// Then display as: <img src={qrImageUrl} />
```

This creates a QR code that points to:
```
https://yourapp.com/api/qrcode/scan?code=UUID
```

When scanned, redirects to login or member dashboard with code in URL.

## Error Handling

All API responses follow this pattern:

### Success (2xx)
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error (4xx/5xx)
```json
{
  "message": "Error description"
}
```

Catch errors with:
```javascript
try {
  const response = await api.post("/member/attendance/checkin", { qrCode });
} catch (error) {
  const message = error.response?.data?.message || "Unknown error";
  setError(message);
}
```

## Example Flow

### 1. Admin generates code
```javascript
const res = await api.post("/admin/qrcode/generate");
const code = res.data.qrCode.code; // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### 2. Display QR image
```javascript
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
  `https://yourapp.com/api/qrcode/scan?code=${code}`
)}`;
// Show image to members
```

### 3. Member scans with device
```
Phone camera scans QR
→ Opens: https://yourapp.com/api/qrcode/scan?code=550e8400-e29b-41d4-a716-446655440000
→ Server validates code
→ Redirects to /login?code=550e8400-e29b-41d4-a716-446655440000 (or /member if logged in)
```

### 4. After login/if already logged in
```javascript
const params = new URLSearchParams(location.search);
const code = params.get("code");
// In AttendanceTab:
if (code) {
  // Auto-fill and auto-submit
  await api.post("/member/attendance/checkin", { qrCode: code });
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing fields, invalid code, already checked in) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (doesn't have permission) |
| 404 | Not found (resource doesn't exist) |
| 500 | Server error |

## Postman/cURL Examples

### Generate QR Code (requires admin token)
```bash
curl -X POST http://localhost:5000/api/admin/qrcode/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Check In with QR Code (requires member token)
```bash
curl -X POST http://localhost:5000/api/member/attendance/checkin \
  -H "Authorization: Bearer YOUR_MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "550e8400-e29b-41d4-a716-446655440000"}'
```

### Validate QR Code (public, no token needed)
```bash
curl http://localhost:5000/api/qrcode/scan?code=550e8400-e29b-41d4-a716-446655440000
```
