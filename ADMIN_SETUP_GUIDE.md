# Admin Account Setup Guide

## Issue Found

The system uses **MongoDB** for user authentication, but there is currently no admin account with email `admin@example.com` in the database.

## Solution

### Option 1: Create Admin Using Script (Recommended)

1. **Navigate to backend directory:**
   ```powershell
   cd kangarubackend
   ```

2. **Run the admin creation script:**
   ```powershell
   node scripts/create-admin.js
   ```

3. **Login credentials:**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `admin`

4. **⚠️ IMPORTANT:** Change the password immediately after first login!

### Option 2: Create Admin Via Registration

1. Go to the signup page
2. Register with any email/password
3. Use MongoDB to manually update the role to "admin"

### Option 3: Update Existing User to Admin

If you already have an account and want to make it admin:

1. **Connect to MongoDB:**
   ```powershell
   # Using mongosh (MongoDB Shell)
   mongosh "<your-mongodb-uri>"
   ```

2. **Update user role:**
   ```javascript
   use your_database_name
   
   // Update specific user to admin
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin", requestedRole: "admin" } }
   )
   ```

3. **Verify:**
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```

## Checking Current Database

### View all users in MongoDB:

```javascript
// Connect to your MongoDB
mongosh "<your-mongodb-uri>"

// Switch to database
use your_database_name

// List all users
db.users.find().pretty()

// Find admin users
db.users.find({ role: "admin" }).pretty()
```

## Troubleshooting

### Script fails with "MongoDB URI not found"

Make sure you have set one of these environment variables in `kangarubackend/.env`:
- `MONGO_URI`
- `MONGODB_URI`
- `DATABASE_URL`

### Can't login after creating admin

1. **Clear browser cache and localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Verify MongoDB connection:**
   - Check backend logs for MongoDB connection status
   - Verify database credentials in `.env`

3. **Check user exists in database:**
   ```javascript
   db.users.findOne({ email: "admin@example.com" })
   ```

### Role-based access not working

The admin panel checks for `user.role === "admin"`. Make sure:
1. User role is exactly "admin" (lowercase)
2. JWT token contains the role claim
3. Token is not expired

## Security Best Practices

1. **Change default password immediately**
2. **Use strong passwords** (minimum 12 characters, mix of letters, numbers, symbols)
3. **Enable 2FA** if available
4. **Regularly audit admin accounts**
5. **Use environment variables** for sensitive data

## Quick Test

After creating admin:

1. Go to login page
2. Enter:
   - Email: `admin@example.com`
   - Password: `admin123` (or whatever you set)
   - Role: `Admin`
3. Click "Sign In"
4. You should be redirected to `/admin/dashboard`

## Files Modified/Created

- ✅ `kangarubackend/scripts/create-admin.js` - Script to create admin user
- 📝 `ADMIN_SETUP_GUIDE.md` - This guide

## Next Steps

Once admin is created and you've logged in:

1. Change your password in admin panel
2. Create other admin accounts if needed
3. Set up proper user role management
4. Review and approve pending user registrations
