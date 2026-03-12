# QR Code Attendance System - Implementation Guide

## Overview
A complete QR code-based attendance system has been implemented that allows:
1. **Admin** to generate and manage attendance QR codes
2. **Members** to scan QR codes from their device scanner or within the app
3. **External QR Scanner Support** - Scanning from any device's native QR code scanner redirects to the app with the code

## Architecture

### Backend Implementation

#### 1. New Model: QRCode (`server/src/models/QRCode.js`)
```javascript
- code: Unique UUID-based code
- isActive: Boolean to enable/disable codes
- createdAt: Timestamp when created
- expiresAt: Optional expiration time
- scannedBy: Array tracking which users scanned this code
```

#### 2. Repository Methods (`server/src/repositories/mongoRepo.js`)
- `createQRCode()` - Generates new code, deactivates old ones
- `getActiveQRCode()` - Returns current active QR code
- `validateQRCode(code)` - Validates if code exists and is active
- `addUserToQRCodeScan(qrCodeId, userId)` - Tracks scan
- `deactivateQRCode(qrCodeId)` - Deactivates a code
- `getQRCodeHistory(limit)` - Gets QR code history with scan data

#### 3. Admin Controller (`server/src/api/controllers/adminController.js`)
New functions:
- `generateQRCode()` - Creates new QR code
- `getActiveQRCode()` - Gets current code (for display)
- `deactivateQRCode()` - Deactivates code
- `getQRCodeHistory()` - Gets history with user scan info

#### 4. Member Controller (`server/src/api/controllers/memberController.js`)
Updated function:
- `checkInAttendance()` - Now validates against active QR code and tracks scans

#### 5. API Routes

**Admin Routes** (`server/src/api/routes/adminRoutes.js`):
```
POST   /admin/qrcode/generate      - Generate new QR code
GET    /admin/qrcode/active        - Get current active code
DELETE /admin/qrcode/:id           - Deactivate code
GET    /admin/qrcode/history       - Get QR code history
```

**Public Routes** (`server/src/api/routes/qrcodeRoutes.js`):
```
GET    /api/qrcode/current         - Get active code (public, for display)
GET    /api/qrcode/scan?code=UUID  - Handle external scanner redirect
```

**Member Routes** (`server/src/api/routes/memberRoutes.js`):
```
POST   /member/attendance/checkin  - Check in with QR code
```

### Frontend Implementation

#### 1. Admin Dashboard (`client/src/pages/AdminDashboardPage.jsx`)

**New Tab: QR Code Management**
- Display current active QR code as image
- Generate QR code via external API (qrserver.com)
- Show unique code for reference
- Deactivate current code
- Generate new code button
- View QR code history with scan data
- See which members have scanned each code

#### 2. Member Dashboard (`client/src/pages/MemberDashboardPage.jsx`)

**Enhanced Attendance Tab**:
- Auto-detect if user came from external QR scanner
- Auto-fill QR code from URL parameter
- Auto-submit code if passed from scan
- Show current active QR code status
- Manual entry for manual input
- Attendance history display

#### 3. Login Page (`client/src/pages/LoginPage.jsx`)

**QR Code Scanner Support**:
- Detects QR code from query parameter
- Preserves code through login flow
- Passes code to member dashboard after successful login
- Seamless redirect to attendance check-in

## How It Works

### Scenario 1: Member Scans from Device
1. Admin generates QR code in admin panel
2. QR code displays with unique UUID embedded with link: `{appURL}/api/qrcode/scan?code={UUID}`
3. Member scans with device camera
4. Browser opens the scan link automatically
5. **If logged in**: Redirected to member dashboard with code in URL query param
6. **If not logged in**: Redirected to login page with code in URL query param
7. After login, automatically goes to member dashboard with code
8. AttendanceTab auto-fills the code and submits
9. Server validates code, marks attendance, adds user to scanned list

### Scenario 2: Member Scans from Web App
1. Member navigates to attendance tab
2. Sees current active QR code status
3. Can manually paste code into input field
4. Clicks "Check In"
5. Server validates code and marks attendance

### Scenario 3: Admin QR Management
1. Admin goes to "QR Code" tab
2. Clicks "Generate QR Code"
3. New code is created, old code deactivated
4. QR code image is displayed
5. Admin can deactivate current code anytime
6. History shows all codes with scan count and users who scanned

## Data Flow

```
Member scans with device
        ↓
Browser opens: /api/qrcode/scan?code=UUID
        ↓
Server validates code (public endpoint)
        ↓
If valid: Returns success
        ↓
Client redirects to:
  /login?code=UUID (if not authenticated)
  /member?code=UUID (if authenticated)
        ↓
LoginPage / MemberDashboardPage detects code in URL
        ↓
AttendanceTab auto-fills code
        ↓
POST /member/attendance/checkin with code
        ↓
Server validates code, creates attendance, adds to scanned list
```

## Key Features

✅ **One Active QR Code at a Time**: Only one code can be active; generating new one deactivates old
✅ **Scan Tracking**: Server tracks which users scanned each code
✅ **External Scanner Support**: Works with native device QR scanner
✅ **Auto-Login Flow**: QR code persists through login
✅ **Auto-Submit**: If user scanned from device, auto-checks in after login
✅ **Manual Entry**: Members can also manually enter code
✅ **Admin Control**: View code history and user scans
✅ **Unique Codes**: Uses UUID for code uniqueness

## Dependencies Added

**Server**: `uuid` (for generating unique QR codes)

## Installation

After pulling these changes:

```bash
# Server setup
cd server
npm install

# Client is already configured
```

## Testing the Feature

### Test 1: Generate QR Code
1. Login as admin
2. Go to "QR Code" tab
3. Click "Generate QR Code"
4. See QR code displayed

### Test 2: Scan with Device
1. Use phone camera to scan the QR code from admin panel
2. Link opens and redirects to:
   - Login page if not authenticated
   - Member dashboard if already authenticated
3. Enter code manually or auto-fill occurs
4. Click "Check In"
5. Attendance is marked

### Test 3: Manual Entry
1. Login as member
2. Go to "Attendance" tab
3. Copy the code from QR code display
4. Paste into "Paste or scan QR code" field
5. Click "Check In"
6. Attendance is marked

### Test 4: View History
1. Admin generates multiple codes
2. Members scan them
3. Go to QR Code tab
4. See history with scan counts and member names

## Database Schema

### QRCode Collection
```javascript
{
  _id: ObjectId,
  code: String (UUID),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date (optional),
  scannedBy: [ObjectId] (refs to User)
}
```

## Security Notes

- QR codes contain UUID that can't be guessed
- Codes are validated on server before creating attendance
- Code must be active to use
- User must be authenticated before marking attendance
- Duplicate check-ins prevented (one per day per user)

## Future Enhancements

- QR code expiration time
- Scheduled QR code rotation
- QR code usage statistics dashboard
- Bulk send QR code to members via email/SMS
- QR code scanner mobile app
- Real-time attendance notifications
