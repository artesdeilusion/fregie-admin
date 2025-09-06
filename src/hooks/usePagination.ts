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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
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
        setAllProducts([]);
        setLastDoc(null);
        setHasMore(true);
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
        setAllProducts(result.data);
        setTotal(result.total || 0);
      } else {
        setAllProducts(prev => [...prev, ...result.data]);
      }
      
      setCurrentPage(page);
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
      // Calculate how many products we need to load to reach this page
      const productsNeeded = page * pageSize;
      const productsLoaded = allProducts.length;
      
      if (productsNeeded <= productsLoaded) {
        // We have enough products loaded, just change the page
        setCurrentPage(page);
      } else if (hasMore) {
        // We need to load more products first
        const pagesToLoad = Math.ceil((productsNeeded - productsLoaded) / pageSize);
        let loadCount = 0;
        
        const loadNextPage = async () => {
          if (loadCount < pagesToLoad && hasMore) {
            loadCount++;
            await fetchProducts(currentPage + loadCount, false);
            if (loadCount < pagesToLoad) {
              loadNextPage();
            } else {
              setCurrentPage(page);
            }
          }
        };
        
        loadNextPage();
      }
    }
  }, [fetchProducts, currentPage, allProducts.length, hasMore, pageSize]);

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
      setAllProducts(prev => [newProduct, ...prev]);
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
      setAllProducts(prev => prev.map(p => p.id === id ? { ...productData, id } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err;
    }
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteProduct(id);
      setAllProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    }
  }, []);

  // Calculate pagination info and slice products for current page
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const products = allProducts.slice(startIndex, endIndex);
  const displayStartIndex = startIndex + 1;
  const displayEndIndex = Math.min(endIndex, total);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    currentPage,
    totalPages,
    startIndex: displayStartIndex,
    endIndex: displayEndIndex,
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
