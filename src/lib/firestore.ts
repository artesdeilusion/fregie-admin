import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { getFirebaseDB } from "./firebase";
import { Product, Preference, FormProduct, FormPreference } from "@/types";

// Pagination interfaces
export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
  searchTerm?: string;
  filterBrand?: string;
  filterType?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  total?: number;
}

// Firestore converters for type safety
const productConverter = {
  toFirestore(product: Product): DocumentData {
    // Additional validation to ensure all data is Firestore-compatible
    const sanitizedData = {
      alergen_warning: Array.isArray(product.alergen_warning) ? product.alergen_warning.map(item => String(item).toLowerCase()) : [],
      barcode: String(product.barcode || ""),
      brand: String(product.brand || ""),
      image_url: String(product.image_url || ""),
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.map(item => String(item).toLowerCase()) : [],
      manufacturer: String(product.manufacturer || ""),
      name: String(product.name || ""),
      net_weight: String(product.net_weight || ""),
      nutritional_info: String(product.nutritional_info || ""),
      origin: String(product.origin || ""),
    };
    
    // Validate that no nested arrays exist
    for (const [key, value] of Object.entries(sanitizedData)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (Array.isArray(item)) {
            throw new Error(`Nested arrays not allowed in Firestore. Field: ${key}`);
          }
        }
      }
    }
    
    return sanitizedData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Product {
    const data = snapshot.data(options);
    
    // Handle existing documents that might not have all fields
    return {
      id: snapshot.id,
      alergen_warning: data.alergen_warning || [],
      barcode: data.barcode || "",
      brand: data.brand || "",
      image_url: data.image_url || "",
      ingredients: data.ingredients || [],
      manufacturer: data.manufacturer || "",
      name: data.name || "",
      net_weight: data.net_weight || "",
      nutritional_info: data.nutritional_info || "",
      origin: data.origin || "",
    };
  },
};

const preferenceConverter = {
  toFirestore(preference: Preference): DocumentData {
    return {
      ingredients: preference.ingredients,
      name: preference.name,
      type: preference.type,
      typeId: preference.typeId,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Preference {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ingredients: data.ingredients || [],
      name: data.name,
      type: data.type,
      typeId: data.typeId,
    };
  },
};

// Collection reference getters
const getProductsCollection = () => {
  const db = getFirebaseDB();
  return collection(db, "products");
};

const getPreferencesCollection = () => {
  const db = getFirebaseDB();
  return collection(db, "preferences").withConverter(preferenceConverter);
};

// Helper function to migrate existing product data
export const migrateProductData = (data: any): Product => {
  // Always return a valid product, even with missing fields
      return {
      id: data.id || "",
      alergen_warning: Array.isArray(data.alergen_warning) ? data.alergen_warning : [],
      barcode: data.barcode || "",
      brand: data.brand || "",
      image_url: data.image_url || "",
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      manufacturer: data.manufacturer || "",
      name: data.name || data.meta?.name || "",
      net_weight: data.net_weight || "",
      nutritional_info: data.nutritional_info || "",
      origin: data.origin || "",
    };
};

// Helper function to migrate existing preference data
export const migratePreferenceData = (data: any): Preference => {
  try {
    // Validate required fields
    if (!data.id) {
      throw new Error('Missing id field');
    }
    
    const migrated = {
      id: data.id || "",
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      name: data.name || "",
      type: data.type || "",
      typeId: data.typeId || "",
    };
    
    return migrated;
  } catch (error) {
    throw error;
  }
};

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  try {
    const rawCollection = getProductsCollection();
    const querySnapshot = await getDocs(rawCollection);
    
    // Use raw data and migrate it
    const rawProducts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id // Ensure we use the document ID
      };
    });
    
    // Migrate all products
    const products = rawProducts.map(migrateProductData);
    
    return products;
  } catch (error) {
    console.error("getProducts: Error getting products:", error);
    throw error;
  }
};

// Paginated product operations
export const getProductsPaginated = async (options: PaginationOptions = {}): Promise<PaginatedResult<Product>> => {
  try {
    const { pageSize = 20, lastDoc, searchTerm, filterBrand } = options;
    const db = getFirebaseDB();
    const productsCollection = collection(db, "products");
    
    // Build query
    let q = query(productsCollection, orderBy("name"), limit(pageSize + 1));
    
    if (lastDoc) {
      q = query(productsCollection, orderBy("name"), startAfter(lastDoc), limit(pageSize + 1));
    }
    
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    
    // Check if there are more documents
    const hasMore = docs.length > pageSize;
    const data = docs.slice(0, pageSize);
    
    // Convert and migrate data
    const rawProducts = data.map(doc => {
      const docData = doc.data();
      return {
        ...docData,
        id: doc.id
      };
    });
    
    const products = rawProducts.map(migrateProductData);
    
    // Apply client-side filtering for search and brand filter
    let filteredProducts = products;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.barcode.includes(searchTerm)
      );
    }
    
    if (filterBrand) {
      filteredProducts = filteredProducts.filter(product => product.brand === filterBrand);
    }
    
    return {
      data: filteredProducts,
      lastDoc: hasMore ? docs[pageSize - 1] : null,
      hasMore
    };
  } catch (error) {
    console.error("getProductsPaginated: Error getting products:", error);
    throw error;
  }
};

export const getProductsCount = async (): Promise<number> => {
  try {
    const db = getFirebaseDB();
    const productsCollection = collection(db, "products");
    const snapshot = await getCountFromServer(productsCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error("getProductsCount: Error getting products count:", error);
    throw error;
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "products", id).withConverter(productConverter);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

export const addProduct = async (productData: FormProduct): Promise<string> => {
  try {
    // Create a temporary product object to use the converter
    const tempProduct: Product = {
      id: '', // Will be set by Firestore
      ...productData,
    };
    
    // Use the converter to properly format the data
    const docData = productConverter.toFirestore(tempProduct);
    

    
    const docRef = await addDoc(getProductsCollection(), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: FormProduct): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "products", id);
    
    // Create a temporary product object to use the converter
    const tempProduct: Product = {
      id,
      ...productData,
    };
    
    // Use the converter to properly format the data
    const docData = productConverter.toFirestore(tempProduct);
    
    await updateDoc(docRef, docData);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Preference operations
export const getPreferences = async (): Promise<Preference[]> => {
  try {
    const rawCollection = getPreferencesCollection();
    const querySnapshot = await getDocs(rawCollection);
    
    // Use raw data and migrate it
    const rawPreferences = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id // Ensure we use the document ID
      };
    });
    
    // Migrate all preferences
    const preferences = rawPreferences.map(migratePreferenceData);
    
    return preferences;
  } catch (error) {
    console.error("getPreferences: Error getting preferences:", error);
    throw error;
  }
};

// Paginated preference operations
export const getPreferencesPaginated = async (options: PaginationOptions = {}): Promise<PaginatedResult<Preference>> => {
  try {
    const { pageSize = 20, lastDoc, searchTerm, filterType } = options;
    const db = getFirebaseDB();
    const preferencesCollection = collection(db, "preferences");
    
    // Build query
    let q = query(preferencesCollection, orderBy("name"), limit(pageSize + 1));
    
    if (lastDoc) {
      q = query(preferencesCollection, orderBy("name"), startAfter(lastDoc), limit(pageSize + 1));
    }
    
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    
    // Check if there are more documents
    const hasMore = docs.length > pageSize;
    const data = docs.slice(0, pageSize);
    
    // Convert and migrate data
    const rawPreferences = data.map(doc => {
      const docData = doc.data();
      return {
        ...docData,
        id: doc.id
      };
    });
    
    const preferences = rawPreferences.map(migratePreferenceData);
    
    // Apply client-side filtering for search and type filter
    let filteredPreferences = preferences;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredPreferences = filteredPreferences.filter(preference => 
        preference.name.toLowerCase().includes(searchLower) ||
        preference.typeId.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterType) {
      filteredPreferences = filteredPreferences.filter(preference => preference.type === filterType);
    }
    
    return {
      data: filteredPreferences,
      lastDoc: hasMore ? docs[pageSize - 1] : null,
      hasMore
    };
  } catch (error) {
    console.error("getPreferencesPaginated: Error getting preferences:", error);
    throw error;
  }
};

export const getPreferencesCount = async (): Promise<number> => {
  try {
    const db = getFirebaseDB();
    const preferencesCollection = collection(db, "preferences");
    const snapshot = await getCountFromServer(preferencesCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error("getPreferencesCount: Error getting preferences count:", error);
    throw error;
  }
};

export const getPreference = async (id: string): Promise<Preference | null> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "preferences", id).withConverter(preferenceConverter);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting preference:", error);
    throw error;
  }
};

export const addPreference = async (preferenceData: FormPreference): Promise<string> => {
  try {
    // Create a temporary preference object to use the converter
    const tempPreference: Preference = {
      id: '', // Will be set by Firestore
      ...preferenceData,
    };
    
    // Use the converter to properly format the data
    const docData = preferenceConverter.toFirestore(tempPreference);
    const docRef = await addDoc(getPreferencesCollection(), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding preference:", error);
    throw error;
  }
};

export const updatePreference = async (id: string, preferenceData: FormPreference): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "preferences", id);
    
    // Create a temporary preference object to use the converter
    const tempPreference: Preference = {
      id,
      ...preferenceData,
    };
    
    // Use the converter to properly format the data
    const docData = preferenceConverter.toFirestore(tempPreference);
    
    await updateDoc(docRef, docData);
  } catch (error) {
    console.error("Error updating preference:", error);
    throw error;
  }
};

export const deletePreference = async (id: string): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "preferences", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting preference:", error);
    throw error;
  }
};
