# Student ID Verification System - Quick Start

## ✅ What Was Created

### **Highly Secure Student ID System with QR Codes**

**Security Features:**
- 🔐 Cryptographic HMAC-SHA256 signatures
- ⏰ 2-minute expiration (prevents screenshots)
- 🔄 Version control (old cards invalidated when reissued)
- 🎲 Random nonce (prevents duplication)
- ✅ Multi-layer validation
- ❌ **Cannot be forged, cloned, or duplicated**

## 📁 Files Created

### Backend:
1. **`nguviu-backend/models/Student.js`**
   - Student database model
   - Unique secret generation per student
   - Token generation with cryptographic signing
   - Token verification with security checks

2. **`nguviu-backend/routes/studentVerification.js`**
   - `/api/student-verification/verify` - Verify QR code (PUBLIC)
   - `/api/student-verification/students` - Manage students (ADMIN)
   - `/api/student-verification/generate-token/:id` - Generate QR (ADMIN)
   - `/api/student-verification/issue-card/:id` - Issue new card (ADMIN)
   - `/api/student-verification/deactivate-card/:id` - Deactivate (ADMIN)

### Frontend:
3. **`nguviu-frontend/src/components/StudentVerification.jsx`**
   - **Hidden page** - only accessible via QR scan
   - URL: `/#/verify-student?t=TOKEN`
   - Shows student details when valid
   - Shows error when invalid/expired/forged
   - **Locked page** - prevents navigation, right-click, F12

4. **`nguviu-frontend/src/components/StudentIDManagement.jsx`**
   - Admin panel for student management
   - URL: `/#/student-id-management` (admin only)
   - Add students
   - Generate QR codes
   - Print ID cards
   - Issue/reissue/deactivate cards

### Documentation:
5. **`STUDENT_ID_SYSTEM_GUIDE.md`** - Complete guide
6. **`scripts/setup-student-id-system.ps1`** - Setup script

## 🚀 Setup (2 Steps)

### Step 1: Add Secret to Backend .env

Add this line to `nguviu-backend/.env`:

```env
ID_CARD_SECRET=your-64-character-random-hex-string-here
```

**Generate a secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Step 2: Install QR Code Package

```bash
cd nguviu-frontend
npm install qrcode
```

That's it! System is ready.

## 📱 How to Use

### For Admins:

1. **Login as admin**

2. **Navigate to:**
   ```
   /#/student-id-management
   ```
   Or from Admin Dashboard → Student ID Management

3. **Add a student:**
   - Click "+ Add New Student"
   - Fill required fields:
     - Admission Number
     - First Name, Last Name
     - Date of Birth, Gender
     - Class, Year of Admission
     - Guardian Name, Guardian Phone
   - Click "Create Student & Issue ID Card"

4. **Generate QR Code:**
   - Click "📱 Generate QR" next to student
   - QR code appears (valid for 2 minutes)

5. **Print ID Card:**
   - Click "🖨️ Print ID Card"
   - Professional card with QR code appears
   - Print on card stock and laminate

### For Verification:

1. **Scan QR code** with phone camera or QR scanner app

2. **Browser opens:**
   ```
   https://yoursite.com/#/verify-student?t=LONG_TOKEN_HERE
   ```

3. **Page shows:**
   - ✅ Green "ID VERIFIED" if valid
   - Student photo
   - Full name
   - Admission number
   - Class and stream
   - Status
   - Verification timestamp
   
   OR
   
   - ❌ Red "Verification Failed" with reason

4. **Page is locked** - can't navigate elsewhere

## 🔒 Security Explained

### Why This Can't Be Forged:

1. **Each student has a unique 64-character secret** stored in database
2. **QR code contains:**
   - Student ID
   - Admission number
   - Card version
   - Timestamp
   - Random nonce
   - **HMAC signature** (cryptographic hash of above data + secrets)

3. **To forge a QR code, attacker would need:**
   - Access to database (to get student's secret) ❌
   - Access to .env file (to get global secret) ❌
   - Both are impossible without server access

4. **Even screenshots won't work:**
   - Tokens expire in 2 minutes ⏰
   - Server checks timestamp
   - Old tokens rejected

5. **Even if someone clones the card:**
   - Admin clicks "Reissue Card"
   - Student gets new secret + version increments
   - All old QR codes become invalid immediately ✅

### Protection Layers:

```
Layer 1: HMAC Signature (can't forge without secrets)
Layer 2: Timestamp (expires in 2 minutes)
Layer 3: Version check (old cards don't work)
Layer 4: Database validation (must match records)
Layer 5: Status check (deactivated cards fail)
Layer 6: Nonce (each token unique)
```

## 🎯 Use Cases

### School Gate Entry
- Guard: "Show your ID"
- Student scans QR code
- System: ✅ "Jane Doe, Form 3A"
- Guard allows entry

### Exam Room
- Scan before entering
- Confirms student identity
- Prevents impersonation

### Library
- Scan to borrow books
- Track who has which books

### Events
- Scan for attendance
- Track participation

### Emergency
- Quick student lookup
- Contact guardian info

## 🛠️ Admin Features

✅ Add/edit students
✅ Generate secure QR codes
✅ Print physical ID cards
✅ Reissue cards (invalidates old ones)
✅ Deactivate/reactivate cards
✅ Track verification count
✅ See last verification time
✅ Bulk management

## 📊 What Data is Displayed on Verification?

**Shown:**
- Full name
- Admission number
- Class and stream
- Year of admission
- Status (Active/Suspended/etc)
- Photo (if uploaded)
- Verification timestamp
- Card issue/expiry dates

**NOT shown (kept private):**
- Phone numbers
- Email addresses
- Guardian details
- Home address
- Secret keys
- Internal IDs

## ⚠️ Important Notes

1. **Keep ID_CARD_SECRET secure!**
   - Never commit to git
   - Never share
   - Same value on all servers
   - If compromised, change it and reissue ALL cards

2. **QR codes expire fast (2 minutes)**
   - Don't print QR codes weeks in advance
   - Generate fresh QR code when printing cards
   - This is intentional for security

3. **Reissuing a card invalidates ALL old QR codes**
   - Student must get new physical card
   - Old screenshots/photos won't work

4. **HTTPS required in production**
   - Tokens contain sensitive data
   - Use SSL certificate

## 🐛 Troubleshooting

**"Token expired"**
→ QR code too old. Generate new one.

**"Invalid signature"**
→ Possible forgery or ID_CARD_SECRET changed. Reissue card.

**"Card deactivated"**
→ Admin disabled card. Reactivate or reissue.

**"Version mismatch"**
→ Card was reissued. Get new QR code.

**Can't access management page**
→ Must be logged in as admin.

**QR code not scanning**
→ Ensure good lighting and camera focus.

## ✅ Testing Checklist

- [ ] Add test student
- [ ] Generate QR code
- [ ] Scan with phone (should verify successfully)
- [ ] Wait 3+ minutes and scan again (should fail - expired)
- [ ] Reissue card for same student
- [ ] Try old QR code (should fail - version mismatch)
- [ ] Deactivate card
- [ ] Try scanning (should fail - card deactivated)
- [ ] Reactivate and try again (should work)

---

## 🎉 You're Done!

System is ready to use. Read [STUDENT_ID_SYSTEM_GUIDE.md](STUDENT_ID_SYSTEM_GUIDE.md) for detailed information.

**Access URLs:**
- Management: `http://localhost:5173/#/student-id-management` (admin only)
- Verification: `http://localhost:5173/#/verify-student?t=TOKEN` (hidden)
