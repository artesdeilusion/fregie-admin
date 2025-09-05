# 🔐 Admin User Setup Guide

This guide will help you set up an admin user in Firebase to access the Fregie Admin interface.

## 📋 Prerequisites

1. **Firebase Project**: You already have a Firebase project (`fregie-f6c00`)
2. **Firebase Authentication**: Must be enabled
3. **Firestore Database**: Must be enabled

## 🚀 Step-by-Step Setup

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fregie-f6c00`)
3. In the left sidebar, click **Authentication**
4. Click **Get started**
5. Go to **Sign-in method** tab
6. Enable **Email/Password** provider
7. Click **Save**

### 2. Create Admin User

#### Option A: Through Firebase Console (Recommended)

1. In **Authentication** section, go to **Users** tab
2. Click **Add user**
3. Enter your admin email and password
4. Click **Add user**
5. **Copy the User UID** (you'll need this for the next step)

#### Option B: Through Your App (Alternative)

1. Temporarily disable authentication in the app
2. Create a user registration form
3. Register your admin account
4. Re-enable authentication

### 3. Set User Role in Firestore

1. In Firebase Console, go to **Firestore Database**
2. Create a new collection called `users`
3. Create a new document with the **User UID** as the document ID
4. Add the following fields:

```json
{
  "email": "your-admin-email@example.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Important**: The `role` field must be exactly `"admin"` (lowercase).

### 4. Test the Login

1. Start your app: `npm run dev`
2. Navigate to the app
3. You should see the login page
4. Enter your admin credentials
5. After successful login, you should see the admin interface

## 🔧 Troubleshooting

### Common Issues

#### 1. "No account found" Error
- Verify the user exists in Firebase Authentication
- Check that the email is correct

#### 2. "Incorrect password" Error
- Reset the password in Firebase Console
- Or delete and recreate the user

#### 3. "Access denied" After Login
- Verify the user document exists in `users` collection
- Check that the `role` field is exactly `"admin"`
- Ensure the document ID matches the User UID

#### 4. User Role Not Loading
- Check Firestore security rules
- Verify the `users` collection exists
- Check browser console for errors

### Firestore Security Rules

Make sure your Firestore security rules allow reading the `users` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read products and preferences
    match /products/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /preferences/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Multiple Admin Users

To add more admin users:

1. Create new users in Firebase Authentication
2. Add corresponding documents in the `users` collection
3. Set `role: "admin"` for each admin user

## 🛡️ Security Best Practices

1. **Strong Passwords**: Use complex passwords for admin accounts
2. **Regular Rotation**: Change admin passwords periodically
3. **Limited Access**: Only give admin access to trusted users
4. **Monitor Logs**: Check Firebase Authentication logs regularly
5. **Backup Users**: Keep a backup admin account

## 🔄 Password Reset

If you forget your admin password:

1. Go to Firebase Console → Authentication → Users
2. Find your admin user
3. Click the three dots menu
4. Select "Reset password"
5. Check your email for reset link

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration in `src/lib/firebase.ts`
3. Check Firebase Console for authentication errors
4. Ensure all Firebase services are enabled

## 🎯 Quick Test

After setup, you should be able to:

1. ✅ See the login page when not authenticated
2. ✅ Login with your admin credentials
3. ✅ Access the admin interface
4. ✅ See your email in the top-right user menu
5. ✅ Logout successfully
6. ✅ Return to login page after logout

---

**Note**: Keep your admin credentials secure and never share them publicly!
