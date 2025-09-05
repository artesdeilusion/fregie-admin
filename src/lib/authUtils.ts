import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDB } from './firebase';

export interface UserRole {
  role: 'admin' | 'user';
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Set user role in Firestore
 * This should be called by an admin user or through a secure admin function
 */
export const setUserRole = async (userId: string, role: 'admin' | 'user', email: string, name?: string) => {
  try {
    const db = getFirebaseDB();
    const userRef = doc(db, 'users', userId);
    
    const userData: UserRole = {
      role,
      email,
      name: name || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(userRef, userData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
};

/**
 * Get user role from Firestore
 */
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const db = getFirebaseDB();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        role: data.role || 'user',
        email: data.email || '',
        name: data.name || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
  try {
    const db = getFirebaseDB();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      role,
      updatedAt: new Date(),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userRole = await getUserRole(userId);
    return userRole?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Create initial admin user
 * This function should be called once to create the first admin user
 * You can call this from a secure environment or admin script
 */
export const createInitialAdmin = async (userId: string, email: string, name?: string) => {
  try {
    await setUserRole(userId, 'admin', email, name);
    console.log(`Admin user created: ${email}`);
    return true;
  } catch (error) {
    console.error('Error creating initial admin:', error);
    throw error;
  }
};
