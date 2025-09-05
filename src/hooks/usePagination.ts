import { useState, useEffect, useCallback, useRef } from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { Product, Preference, FormProduct, FormPreference } from "@/types";
import {
  getProductsPaginated,
  getPreferencesPaginated,
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

// Enhanced pagination hook for products
export function useProductPagination() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  
  const pageSize = 20;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilterBrand = useDebounce(filterBrand, 300);
  const isInitialLoad = useRef(true);
  const searchResetRef = useRef(false);

  const fetchProducts = useCallback(async (page: number = 1, reset = false) => {
    try {
      if (reset || page === 1) {
        setLoading(true);
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const options: PaginationOptions = {
        pageSize,
        lastDoc: reset || page === 1 ? undefined : lastDoc || undefined,
        searchTerm: debouncedSearchTerm || undefined,
        filterBrand: debouncedFilterBrand || undefined,
      };
      
      const result: PaginatedResult<Product> = await getProductsPaginated(options);
      
      if (reset || page === 1) {
        setProducts(result.data);
        setTotal(result.total || 0);
        setCurrentPage(1);
      } else {
        setProducts(prev => [...prev, ...result.data]);
        setCurrentPage(page);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('useProductPagination: Error fetching products:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc, debouncedSearchTerm, debouncedFilterBrand, pageSize]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProducts(currentPage + 1, false);
    }
  }, [fetchProducts, loadingMore, hasMore, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page !== currentPage) {
      fetchProducts(page, true);
    }
  }, [fetchProducts, currentPage]);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
    searchResetRef.current = true;
  }, []);

  const filterByBrand = useCallback((brand: string) => {
    setFilterBrand(brand);
    searchResetRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setSearchTerm("");
    setFilterBrand("");
    setCurrentPage(1);
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchProducts(1, true);
      isInitialLoad.current = false;
    }
  }, [fetchProducts]);

  // Reset when search or filter changes (but only if it's not the initial load)
  useEffect(() => {
    if (!isInitialLoad.current && searchResetRef.current) {
      fetchProducts(1, true);
      searchResetRef.current = false;
    }
  }, [debouncedSearchTerm, debouncedFilterBrand, fetchProducts]);

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

  // Calculate pagination info
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    searchTerm,
    filterBrand,
    search,
    filterByBrand,
    loadMore,
    goToPage,
    reset,
    addProduct: addNewProduct,
    updateProduct: updateExistingProduct,
    deleteProduct: removeProduct,
    refetch: () => fetchProducts(1, true),
  };
}

// Enhanced pagination hook for preferences
export function usePreferencePagination() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  
  const pageSize = 20;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilterType = useDebounce(filterType, 300);
  const isInitialLoad = useRef(true);
  const searchResetRef = useRef(false);

  const fetchPreferences = useCallback(async (page: number = 1, reset = false) => {
    try {
      if (reset || page === 1) {
        setLoading(true);
        setPreferences([]);
        setLastDoc(null);
        setHasMore(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const options: PaginationOptions = {
        pageSize,
        lastDoc: reset || page === 1 ? undefined : lastDoc || undefined,
        searchTerm: debouncedSearchTerm || undefined,
        filterType: debouncedFilterType || undefined,
      };
      
      const result: PaginatedResult<Preference> = await getPreferencesPaginated(options);
      
      if (reset || page === 1) {
        setPreferences(result.data);
        setTotal(result.total || 0);
        setCurrentPage(1);
      } else {
        setPreferences(prev => [...prev, ...result.data]);
        setCurrentPage(page);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('usePreferencePagination: Error fetching preferences:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch preferences");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc, debouncedSearchTerm, debouncedFilterType, pageSize]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPreferences(currentPage + 1, false);
    }
  }, [fetchPreferences, loadingMore, hasMore, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page !== currentPage) {
      fetchPreferences(page, true);
    }
  }, [fetchPreferences, currentPage]);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
    searchResetRef.current = true;
  }, []);

  const filterByType = useCallback((type: string) => {
    setFilterType(type);
    searchResetRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setSearchTerm("");
    setFilterType("");
    setCurrentPage(1);
    setLastDoc(null);
    setHasMore(true);
    fetchPreferences(1, true);
  }, [fetchPreferences]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchPreferences(1, true);
      isInitialLoad.current = false;
    }
  }, [fetchPreferences]);

  // Reset when search or filter changes (but only if it's not the initial load)
  useEffect(() => {
    if (!isInitialLoad.current && searchResetRef.current) {
      fetchPreferences(1, true);
      searchResetRef.current = false;
    }
  }, [debouncedSearchTerm, debouncedFilterType, fetchPreferences]);

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

  // Calculate pagination info
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return {
    preferences,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    searchTerm,
    filterType,
    search,
    filterByType,
    loadMore,
    goToPage,
    reset,
    addPreference: addNewPreference,
    updatePreference: updateExistingPreference,
    deletePreference: removePreference,
    refetch: () => fetchPreferences(1, true),
  };
}
