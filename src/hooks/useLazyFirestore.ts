import { useState, useEffect, useCallback, useRef } from "react";
import { Product, Preference, FormProduct, FormPreference } from "@/types";
import {
  getProductsPaginated,
  getPreferencesPaginated,
  getProductsCount,
  getPreferencesCount,
  addProduct,
  updateProduct,
  deleteProduct,
  addPreference,
  updatePreference,
  deletePreference,
  PaginationOptions,
  PaginatedResult,
} from "@/lib/firestore";

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for paginated products with search and filtering
export function useLazyProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [lastDoc, setLastDoc] = useState<any>(null);
  
  const pageSize = 20;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilterBrand = useDebounce(filterBrand, 300);
  const isInitialLoad = useRef(true);

  const fetchProducts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const options: PaginationOptions = {
        pageSize,
        lastDoc: reset ? undefined : lastDoc,
        searchTerm: debouncedSearchTerm || undefined,
        filterBrand: debouncedFilterBrand || undefined,
      };
      
      const result: PaginatedResult<Product> = await getProductsPaginated(options);
      
      if (reset) {
        setProducts(result.data);
        setTotal(result.total || 0);
      } else {
        setProducts(prev => [...prev, ...result.data]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('useLazyProducts: Error fetching products:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc, debouncedSearchTerm, debouncedFilterBrand, pageSize]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProducts(false);
    }
  }, [fetchProducts, loadingMore, hasMore]);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filterByBrand = useCallback((brand: string) => {
    setFilterBrand(brand);
  }, []);

  const reset = useCallback(() => {
    setSearchTerm("");
    setFilterBrand("");
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(true);
  }, [fetchProducts]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchProducts(true);
      isInitialLoad.current = false;
    }
  }, [fetchProducts]);

  // Reset when search or filter changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchProducts(true);
    }
  }, [debouncedSearchTerm, debouncedFilterBrand]);

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

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    searchTerm,
    filterBrand,
    search,
    filterByBrand,
    loadMore,
    reset,
    addProduct: addNewProduct,
    updateProduct: updateExistingProduct,
    deleteProduct: removeProduct,
    refetch: () => fetchProducts(true),
  };
}

// Hook for paginated preferences with search and filtering
export function useLazyPreferences() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [lastDoc, setLastDoc] = useState<any>(null);
  
  const pageSize = 20;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilterType = useDebounce(filterType, 300);
  const isInitialLoad = useRef(true);

  const fetchPreferences = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPreferences([]);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const options: PaginationOptions = {
        pageSize,
        lastDoc: reset ? undefined : lastDoc,
        searchTerm: debouncedSearchTerm || undefined,
        filterType: debouncedFilterType || undefined,
      };
      
      const result: PaginatedResult<Preference> = await getPreferencesPaginated(options);
      
      if (reset) {
        setPreferences(result.data);
        setTotal(result.total || 0);
      } else {
        setPreferences(prev => [...prev, ...result.data]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('useLazyPreferences: Error fetching preferences:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch preferences");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc, debouncedSearchTerm, debouncedFilterType, pageSize]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPreferences(false);
    }
  }, [fetchPreferences, loadingMore, hasMore]);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filterByType = useCallback((type: string) => {
    setFilterType(type);
  }, []);

  const reset = useCallback(() => {
    setSearchTerm("");
    setFilterType("");
    setLastDoc(null);
    setHasMore(true);
    fetchPreferences(true);
  }, [fetchPreferences]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchPreferences(true);
      isInitialLoad.current = false;
    }
  }, [fetchPreferences]);

  // Reset when search or filter changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchPreferences(true);
    }
  }, [debouncedSearchTerm, debouncedFilterType]);

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

  return {
    preferences,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    searchTerm,
    filterType,
    search,
    filterByType,
    loadMore,
    reset,
    addPreference: addNewPreference,
    updatePreference: updateExistingPreference,
    deletePreference: removePreference,
    refetch: () => fetchPreferences(true),
  };
}
