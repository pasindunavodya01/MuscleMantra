# QR Code System - Visual Architecture & Flow Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GYM MANAGEMENT SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────────────────┐  │
│  │  ADMIN PANEL     │          │     MEMBER DASHBOARD          │  │
│  │                  │          │                               │  │
│  │ • QR Code Tab    │          │ • Attendance Tab             │  │
│  │   - Generate     │          │   - Scan QR Code            │  │
│  │   - Deactivate   │          │   - Manual Entry            │  │
│  │   - View History │          │   - History View            │  │
│  │   - See Scans    │          │   - Auto Check-in           │  │
│  └──────────────────┘          └──────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          │                                           │
          │ API Calls                                 │ API Calls
          ▼                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            ADMIN ROUTES (/admin/qrcode/*)                 │  │
│  │  POST   /generate   → generateQRCode()                     │  │
│  │  GET    /active     → getActiveQRCode()                    │  │
│  │  DELETE /:id        → deactivateQRCode()                   │  │
│  │  GET    /history    → getQRCodeHistory()                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            MEMBER ROUTES (/member/*)                       │  │
│  │  POST   /attendance/checkin → checkInAttendance()          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            PUBLIC ROUTES (/qrcode/*)                       │  │
│  │  GET    /current          → getActiveQRCode()              │  │
│  │  GET    /scan?code=UUID   → validateQRCode()               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            DATABASE (MongoDB)                              │  │
│  │  QRCode Collection:                                         │  │
│  │  ├─ _id                                                     │  │
│  │  ├─ code (UUID)                                             │  │
│  │  ├─ isActive (Boolean)                                      │  │
│  │  ├─ createdAt                                               │  │
│  │  ├─ scannedBy (Array of User IDs)                           │  │
│  │  └─ expiresAt (optional)                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## QR Code Generation & Display Flow

```
ADMIN GENERATES QR CODE
│
├─ POST /admin/qrcode/generate
│
├─ Server:
│  ├─ Deactivates old QR codes
│  ├─ Creates new QRCode in MongoDB
│  │  ├─ Generate UUID
│  │  ├─ Set isActive = true
│  │  └─ Set createdAt = now
│  └─ Returns: { id, code: "UUID" }
│
├─ Frontend:
│  ├─ Receives code: "550e8400-e29b-41d4-a716-446655440000"
│  └─ Generates QR image URL:
│     https://api.qrserver.com/v1/create-qr-code/?data={appUrl}/api/qrcode/scan?code={UUID}
│
├─ QR Image Points To:
│  └─ https://yourapp.com/api/qrcode/scan?code=550e8400-e29b-41d4-a716-446655440000
│
└─ Display To Members
   └─ QR image shown in admin panel or printed/displayed at gym
```

## Member Scan Flow (Device Scanner → Web)

```
MEMBER SCANS WITH PHONE CAMERA
│
└─ Phone Camera Detects QR
   │
   └─ Opens Link: 
      https://yourapp.com/api/qrcode/scan?code=550e8400-e29b-41d4-a716-446655440000
      │
      ├─ Server validates code (public endpoint)
      │  ├─ Check if code exists
      │  ├─ Check if isActive = true
      │  └─ Return: { success: true, code: "..." }
      │
      └─ Browser Redirects:
         │
         ├─ IF NOT LOGGED IN:
         │  └─ /login?code=550e8400-e29b-41d4-a716-446655440000
         │     │
         │     └─ LoginPage detects code in URL
         │        │
         │        └─ After successful login:
         │           └─ Navigate to /member?code=550e8400-e29b-41d4-a716-446655440000
         │
         └─ IF ALREADY LOGGED IN:
            └─ /member?code=550e8400-e29b-41d4-a716-446655440000
               │
               └─ MemberDashboard detects code in URL
                  │
                  └─ Navigates to Attendance tab
                     │
                     └─ AttendanceTab receives code
                        │
                        ├─ Auto-fills QR code input
                        ├─ Auto-submits form
                        │
                        └─ POST /member/attendance/checkin
                           ├─ Validate QR code
                           ├─ Check not checked in today
                           ├─ Create attendance record
                           ├─ Add user to scannedBy array
                           └─ Return: { attendance, message: "Check-in successful" }
                              │
                              └─ SUCCESS! Attendance marked ✅
```

## Member Manual Entry Flow

```
MEMBER NAVIGATES TO ATTENDANCE TAB
│
├─ AttendanceTab Loads
│  ├─ Fetches current QR code (optional display)
│  └─ Shows "Paste or scan QR code" input
│
├─ Member Pastes Code
│  └─ Enters or copies code from somewhere
│
├─ Clicks "Check In"
│  │
│  └─ POST /member/attendance/checkin
│     ├─ Validate QR code
│     │  ├─ Check if code exists
│     │  └─ Check if isActive = true
│     ├─ Check not checked in today
│     ├─ Create attendance record
│     ├─ Add user to scannedBy array
│     └─ Return success
│
└─ SUCCESS! Attendance marked ✅
```

## Admin QR Code History View

```
ADMIN VIEWS QR CODE HISTORY
│
├─ GET /admin/qrcode/history
│
├─ Server Returns:
│  └─ [
│      {
│        "_id": "ObjectId",
│        "code": "550e8400...",
│        "isActive": false,
│        "createdAt": "2026-03-12T10:00:00Z",
│        "scannedBy": [
│          { "_id": "...", "name": "John Doe", "email": "john@..." },
│          { "_id": "...", "name": "Jane Doe", "email": "jane@..." }
│        ]
│      }
│    ]
│
├─ Frontend Displays:
│  ├─ Code: 550e8400...
│  ├─ Status: Active/Inactive
│  ├─ Created: 2026-03-12 10:00:00
│  ├─ Scanned By: John Doe, Jane Doe
│  └─ Scans: 2
│
└─ Admin can see who participated ✅
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     QR CODE LIFECYCLE                           │
└─────────────────────────────────────────────────────────────────┘

CREATION
  Admin → POST /admin/qrcode/generate → MongoDB
           └─ New QRCode { code: UUID, isActive: true, ... }

STORAGE
  MongoDB QRCode Collection
  {
    _id: ObjectId,
    code: "550e8400-e29b-41d4-a716-446655440000",
    isActive: true,
    createdAt: Date,
    scannedBy: [UserID1, UserID2, ...],
    updatedAt: Date
  }

DISPLAY
  Admin Panel → GET /admin/qrcode/active → Shows QR image
  (Image URL: api.qrserver.com/v1/create-qr-code/?data=...)

SCANNING
  Member Device Camera
       ↓
  Opens: /api/qrcode/scan?code=UUID (public, no auth)
       ↓
  Server: validateQRCode(code) → { success: true }
       ↓
  Redirect to /login or /member with code in URL
       ↓
  Member logs in (if needed)
       ↓
  POST /member/attendance/checkin { qrCode: UUID }
       ↓
  Server validates & creates Attendance record
       ↓
  Updates QRCode.scannedBy array with member ID
       ↓
  Success! ✅

VIEWING HISTORY
  Admin → GET /admin/qrcode/history → MongoDB.QRCode.find()
           └─ Populates scannedBy with User data
           └─ Shows all codes with scan counts & member names

DEACTIVATION
  Admin → DELETE /admin/qrcode/{id} → Sets isActive = false
           └─ Code can no longer be used for check-ins
```

## State Diagram

```
                          ┌─────────────────────┐
                          │  NO QR CODE YET     │
                          └──────────┬──────────┘
                                     │
                                     │ Admin generates
                                     ▼
                          ┌─────────────────────┐
                          │  ACTIVE QR CODE     │◄───┐
                          │                     │    │
                          │ Code: UUID          │    │
                          │ isActive: true      │    │
                          │ Scans: 0-N          │    │
                          └──────────┬──────────┘    │
                                     │                │
                    ┌────────────────┼────────────────┤
                    │                │                │
            Member scans    Admin generates    Member checks in
                    │          new code            │
                    │                │             │
                    └────────────────►Deactivate   │
                                     old code◄─────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │ INACTIVE QR CODE    │
                          │                     │
                          │ Code: UUID          │
                          │ isActive: false     │
                          │ Scans: recorded     │
                          │ History: kept       │
                          └─────────────────────┘
```

## File Structure

```
server/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   └── QRCode.js ← NEW
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── adminController.js (updated: +4 functions)
│   │   │   └── memberController.js (updated: enhanced check-in)
│   │   └── routes/
│   │       ├── adminRoutes.js (updated: +4 routes)
│   │       ├── memberRoutes.js (updated)
│   │       └── qrcodeRoutes.js ← NEW
│   └── repositories/
│       └── mongoRepo.js (updated: +6 methods)
│
client/src/pages/
├── AdminDashboardPage.jsx (updated: added QR Code tab)
├── MemberDashboardPage.jsx (updated: QR code detection)
└── LoginPage.jsx (updated: QR code flow)
```

## Integration Points

```
Admin Controller
    ↓
QRCode Model ← Stored in MongoDB
    ↓
Repository (CRUD operations)
    ↓
Admin Routes ← /admin/qrcode/*
    ↓
Admin Dashboard (React)

Public Routes ← /api/qrcode/*
    ↓
External Scanner
    ↓
LoginPage / MemberDashboard
    ↓
Member Controller
    ↓
Attendance Model + QRCode Model
    ↓
Both updated in MongoDB
```

---

This visual guide shows how all components interact to create a seamless QR code attendance system!
