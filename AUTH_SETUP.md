# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the Fregie Admin panel.

## 🔥 Firebase Console Setup

### 1. Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Enable the first option: **Email/Password**
6. Click **Save**

### 2. Create Your First Admin User

#### Option A: Using the Test Script (Recommended)
```bash
# Run the test script to create an admin user
node scripts/test-auth.js
```

This will create a test admin user with:
- **Email**: `admin@fregie.com`
- **Password**: `admin123456`
- **Role**: `admin`

#### Option B: Manual Creation
1. Go to **Authentication** → **Users** in Firebase Console
2. Click **Add user**
3. Enter email and password
4. Create the user
5. Copy the User UID
6. Go to **Firestore Database**
7. Create a document in the `users` collection with the User UID as document ID
8. Add the following fields:
   ```json
   {
     "role": "admin",
     "email": "your-email@example.com",
     "name": "Your Name",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```

#### Option C: Using the Admin Script
```bash
# Create admin user with custom email and name
node scripts/create-admin.js your-email@example.com "Your Name"
```

## 🔧 Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🚀 Testing the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser (usually `http://localhost:3000`)

3. **Try logging in** with your admin credentials

4. **Check the console** for any error messages

## 🔍 Troubleshooting

### Common Issues

#### "auth/invalid-credential" Error
- **Cause**: Wrong email/password or user doesn't exist
- **Solution**: 
  - Verify the email and password are correct
  - Check if the user exists in Firebase Console
  - Make sure the user has an admin role in Firestore

#### "auth/operation-not-allowed" Error
- **Cause**: Email/password authentication is not enabled
- **Solution**: Enable Email/Password in Firebase Console → Authentication → Sign-in method

#### "auth/network-request-failed" Error
- **Cause**: Network connectivity issues
- **Solution**: Check your internet connection and Firebase service status

#### User Can't Access Admin Panel
- **Cause**: User doesn't have admin role
- **Solution**: 
  - Check Firestore `users` collection
  - Ensure the document has `role: "admin"`
  - Verify the document ID matches the Firebase Auth UID

### Debug Steps

1. **Check Firebase Console**:
   - Authentication → Users (should show your user)
   - Firestore → users collection (should have user document with admin role)

2. **Check Browser Console**:
   - Look for Firebase errors
   - Check network requests to Firebase

3. **Run Test Script**:
   ```bash
   node scripts/test-auth.js
   ```

## 📝 User Management

### Adding New Admin Users
1. Create user in Firebase Authentication
2. Add document to Firestore `users` collection with `role: "admin"`
3. Or use the admin management interface in Settings → User Management

### Changing User Roles
1. Go to Settings → User Management in the admin panel
2. Use the dropdown to change user roles
3. Or manually update the Firestore document

## 🔒 Security Notes

- **Admin Access**: Only users with `role: "admin"` can access the admin panel
- **User Creation**: New users are created with `role: "user"` by default
- **Role Management**: Only admins can change user roles
- **Session Management**: Users stay logged in until they explicitly log out

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Ensure all environment variables are set correctly
4. Check Firebase Console for user and role setup
