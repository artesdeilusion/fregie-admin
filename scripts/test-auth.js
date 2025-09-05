/**
 * Test script to verify Firebase Authentication setup
 * This script will help you test if Firebase Auth is properly configured
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testFirebaseAuth() {
  try {
    console.log('🔥 Testing Firebase Authentication...\n');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');
    console.log(`📧 Auth Domain: ${firebaseConfig.authDomain}`);
    console.log(`🆔 Project ID: ${firebaseConfig.projectId}\n`);

    // Test credentials
    const testEmail = 'admin@fregie.com';
    const testPassword = 'admin123456';
    const testName = 'Admin User';

    console.log('🔐 Testing user creation...');
    
    try {
      // Try to create a test user
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Test user created successfully');
      console.log(`🆔 User ID: ${userCredential.user.uid}`);
      console.log(`📧 Email: ${userCredential.user.email}`);

      // Create user document in Firestore
      const userData = {
        role: 'admin',
        email: testEmail,
        name: testName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('✅ User document created in Firestore with admin role');

      console.log('\n🎉 Test completed successfully!');
      console.log('You can now log in with:');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Password: ${testPassword}`);

    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('ℹ️  User already exists, testing sign in...');
        
        try {
          const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('✅ Sign in successful');
          console.log(`🆔 User ID: ${signInResult.user.uid}`);
          console.log(`📧 Email: ${signInResult.user.email}`);
          
          console.log('\n🎉 Test completed successfully!');
          console.log('You can log in with:');
          console.log(`📧 Email: ${testEmail}`);
          console.log(`🔑 Password: ${testPassword}`);
        } catch (signInError) {
          console.error('❌ Sign in failed:', signInError.message);
          console.log('\n💡 Possible solutions:');
          console.log('1. Check if the user exists in Firebase Console');
          console.log('2. Verify the password is correct');
          console.log('3. Check if email/password authentication is enabled');
        }
      } else {
        console.error('❌ User creation failed:', createError.message);
        console.log('\n💡 Possible solutions:');
        console.log('1. Enable email/password authentication in Firebase Console');
        console.log('2. Check your Firebase configuration');
        console.log('3. Verify your project settings');
      }
    }

  } catch (error) {
    console.error('❌ Firebase setup error:', error.message);
    console.log('\n💡 Please check:');
    console.log('1. Your .env.local file contains correct Firebase config');
    console.log('2. Firebase project is properly set up');
    console.log('3. Authentication is enabled in Firebase Console');
  }
}

// Check if Firebase config is available
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ Error: Firebase configuration not found');
  console.log('Make sure your .env.local file contains the Firebase configuration');
  process.exit(1);
}

testFirebaseAuth();
