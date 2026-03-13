# Quick Testing Guide - QR Attendance System

## 🔍 Before You Test
- Make sure the server and client are both running
- Clear browser cache/sessionStorage before each test
- Browser DevTools (F12) → Application → SessionStorage to monitor changes

---

## 🟢 Core Tests (Do These First)

### Test 1: Fresh Check-In
**What to do:**
1. Login as a member
2. Go to Attendance tab
3. Copy/paste or scan a fresh QR code
4. Click "Check In"

**Expected:**
- ✅ Success message appears
- ✅ Attendance history updates with check-in time
- ✅ Input field becomes empty
- ✅ sessionStorage shows `qrCodeUsed = true`

---

### Test 2: THE CRITICAL BUG TEST - Page Refresh After Check-In
**What to do:**
1. Complete Test 1 (fresh check-in)
2. **Press F5 or Cmd+R to refresh the page**
3. Wait for page to load completely

**Expected (This was the bug):**
- ✅ NO automatic check-out occurs
- ✅ Attendance history still shows only check-in (no checkout time)
- ✅ Input field is empty
- ✅ No error or success messages appear
- ✅ sessionStorage is cleared

**If this fails**: The bug is not fixed. Check console (F12) for errors.

---

### Test 3: Check-Out Flow
**What to do:**
1. Make sure you have an active check-in (from Test 1 or 2)
2. Scan/enter the SAME QR code again
3. Click "Check In"

**Expected:**
- ✅ Message says "Check-out successful"
- ✅ Attendance history shows both check-in and check-out times
- ✅ Duration is calculated (e.g., "1h 23m")

---

### Test 4: Duplicate Check-In Prevention
**What to do:**
1. Make sure you're already checked in AND checked out today (Test 3)
2. Try to scan/enter the same QR code again
3. Click "Check In"

**Expected:**
- ✅ Error message: "You have already checked in and checked out today..."
- ✅ No new record is created
- ✅ History doesn't change

---

### Test 5: Invalid QR Code
**What to do:**
1. Type a random gibberish code (e.g., "abc123xyz")
2. Click "Check In"

**Expected:**
- ✅ Error message: "Invalid or inactive QR code"
- ✅ Input field retains the invalid code (so user can clear and retry)
- ✅ No record is created

---

### Test 6: Empty Code Submission
**What to do:**
1. Leave the input field empty
2. Try to click "Check In"

**Expected:**
- ✅ Button is disabled or shows validation error
- ✅ Submission is prevented

---

## 🔵 Advanced Tests

### Test 7: External QR Scanner Simulation
**What to do:**
1. Admin generates a QR code (in admin panel)
2. You'll see a QR code image and a code (like long UUID)
3. Logout or open new incognito window
4. Navigate to: `http://localhost:3001/api/qrcode/scan?code=<PASTE_THE_UUID_HERE>`
5. Should auto-redirect to login

**Expected:**
- ✅ Redirected to login page with `code` in URL
- ✅ After login, redirected to member dashboard with code still in URL
- ✅ Code auto-fills and auto-submits
- ✅ Page shows check-in success
- **Now refresh page** - should NOT re-checkout

---

### Test 8: Multiple Users Same QR Code (on different days)
**What to do:**
1. User A: Check-in and check-out with code on Day 1
2. Next day (or simulate time passage): User A checks-in again with same code
3. Should work without issues

**Expected:**
- ✅ New attendance record is created (different date)
- ✅ Both days show in history
- ✅ No conflicts

---

### Test 9: Rapid-Fire QR Code Submissions (Spam Protection)
**What to do:**
1. Check-in with a code
2. BEFORE the response completes, try to submit again
3. Click button multiple times rapidly

**Expected:**
- ✅ Button shows "Checking In..." and is disabled
- ✅ Only one submission goes through
- ✅ No duplicate records created

---

## 🔴 Troubleshooting

### Problem: After check-in, page refresh still causes checkout
**Solution:**
- Clear sessionStorage completely
- Verify frontend changes are applied
- Check browser console for JavaScript errors
- Make sure latest code is deployed

### Problem: Invalid QR code error even with valid code
**Solution:**
- Verify QR code is currently active (check in admin panel)
- Check database connection
- Verify code is not expired

### Problem: Multiple auto-submissions happening
**Solution:**
- Clear browser sessionStorage
- Force refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that `qrCodeUsed` flag is being set

### Problem: Page refresh shows loading indefinitely
**Solution:**
- Check server logs for errors
- Verify database indexes were created
- Restart both frontend and backend servers

---

## 📊 What to Monitor in DevTools

### Application → SessionStorage → localhost:5173
Initially empty, then shows:
```
qrCodeFromScan: (UUID after redirect)
qrCodeUsed: "false"
```

After successful check-in:
```
qrCodeUsed: "true"
```

After refresh:
```
(Both keys should be gone)
```

### Console (F12)
- Should NOT see errors about "Multiple submissions"
- Should see API responses with `status: "checkin"` or `status: "checkout"`

---

## ✅ Sign-Off Checklist
Before considering it "fixed", verify:

- [ ] Test 1 passes (fresh check-in works)
- [ ] Test 2 passes (refresh doesn't checkout) ← **CRITICAL**
- [ ] Test 3 passes (check-out works)
- [ ] Test 4 passes (duplicate prevention)
- [ ] Test 5 passes (invalid code handling)
- [ ] Test 6 passes (empty code validation)
- [ ] Test 7 passes (external scanner redirect)
- [ ] No JavaScript errors in console
- [ ] Database indexes are created
- [ ] All API responses include new status field

---

**If all tests pass, the QR attendance system is fully fixed! 🎉**
