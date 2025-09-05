import { useState, useEffect, useCallback } from "react";
import { Product, Preference, FormProduct, FormPreference } from "@/types";
import {
  getProducts,
  getPreferences,
  addProduct,
  updateProduct,
  deleteProduct,
  addPreference,
  updatePreference,
  deletePreference,
} from "@/lib/firestore";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('useProducts: Error fetching products:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewProduct = useCallback(async (productData: FormProduct) => {
    try {
      setError(null);
      const newId = await addProduct(productData);
      const newProduct: Product = {
        ...productData,
        id: newId,
      };
      setProducts(prev => [newProduct, ...prev]);
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
      throw err;
    }
  }, []);

  const updateExistingProduct = useCallback(async (id: string, productData: FormProduct) => {
    try {
      setError(null);
      await updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? { ...productData, id } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err;
    }
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    addProduct: addNewProduct,
    updateProduct: updateExistingProduct,
    deleteProduct: removeProduct,
    refetch: fetchProducts,
  };
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPreferences();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewPreference = useCallback(async (preferenceData: FormPreference) => {
    try {
      setError(null);
      const newId = await addPreference(preferenceData);
      const newPreference: Preference = {
        ...preferenceData,
        id: newId,
      };
      setPreferences(prev => [newPreference, ...prev]);
      return newId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add preference");
      throw err;
    }
  }, []);

  const updateExistingPreference = useCallback(async (id: string, preferenceData: FormPreference) => {
    try {
      setError(null);
      await updatePreference(id, preferenceData);
      setPreferences(prev => prev.map(p => p.id === id ? { ...preferenceData, id } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preference");
      throw err;
    }
  }, []);

  const removePreference = useCallback(async (id: string) => {
    try {
      setError(null);
      await deletePreference(id);
      setPreferences(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete preference");
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    addPreference: addNewPreference,
    updatePreference: updateExistingPreference,
    deletePreference: removePreference,
    refetch: fetchPreferences,
  };
}
