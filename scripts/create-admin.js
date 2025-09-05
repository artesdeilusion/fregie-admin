/**
 * Script to create the first admin user
 * Run this script to create an admin user in Firestore
 * 
 * Usage: node scripts/create-admin.js <email> <name>
 * Example: node scripts/create-admin.js admin@fregie.com "Admin User"
 */

const { initializeApp } = require('firebase/app');
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

async function createAdminUser(email, name) {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Create a temporary user ID (in real scenario, this would be the actual user ID from Firebase Auth)
    const userId = `temp_${Date.now()}`;
    
    // Create admin user document
    const userData = {
      role: 'admin',
      email: email,
      name: name || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', userId), userData);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name || 'Not provided');
    console.log('🆔 User ID:', userId);
    console.log('');
    console.log('⚠️  Note: This is a temporary user ID. In production, you should:');
    console.log('1. Create the user through Firebase Auth first');
    console.log('2. Use the actual Firebase Auth UID as the document ID');
    console.log('3. Or use the Firebase Admin SDK to create users programmatically');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const name = args[1];

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('Usage: node scripts/create-admin.js <email> <name>');
  console.log('Example: node scripts/create-admin.js admin@fregie.com "Admin User"');
  process.exit(1);
}

// Check if Firebase config is available
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ Error: Firebase configuration not found');
  console.log('Make sure your .env.local file contains the Firebase configuration');
  process.exit(1);
}

createAdminUser(email, name);
