"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, FormProduct } from "@/types";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowUpTrayIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  // FunnelIcon, // Unused import
  ArrowsUpDownIcon,
  // EllipsisHorizontalIcon // Unused import
} from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import ProductUploadForm from "./ProductUploadForm";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { useLazyProducts } from "@/hooks/useLazyFirestore";
import { saveProductToDataFolder, validateProductData } from "@/lib/dataUtils";
import { getAllUniqueBrands, getAllUniqueCategories } from "@/lib/firestore";

type SortOption = 'name' | 'brand' | 'category';
type SortDirection = 'asc' | 'desc';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action: (selectedProducts: Product[]) => void;
  destructive?: boolean;
}

export default function EnhancedProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchInput, setSearchInput] = useState("");
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const { 
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
    addProduct, 
    updateProduct, 
    deleteProduct, 
    refetch 
  } = useLazyProducts();

  // Since we're using server-side filtering, we only need client-side category filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = !filterCategory || product.category === filterCategory;
      return matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      const aValue = String(a[sortBy] || '').toLowerCase();
      const bValue = String(b[sortBy] || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, filterCategory, sortBy, sortDirection]);

  const uniqueBrands = useMemo(() => {
    return allBrands;
  }, [allBrands]);

  const uniqueCategories = useMemo(() => {
    return allCategories;
  }, [allCategories]);

  const bulkActions: BulkAction[] = [
    {
      id: 'edit',
      label: 'Bulk Edit',
      icon: PencilIcon,
      action: (products) => handleBulkEdit(products)
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: TrashIcon,
      action: (products) => handleBulkDelete(products),
      destructive: true
    }
  ];

  const handleBulkEdit = (products: Product[]) => {
    console.log('Bulk editing products:', products);
    // Implement bulk edit functionality
  };

  const handleBulkDelete = async (products: Product[]) => {
    if (confirm(`Are you sure you want to delete ${products.length} selected products?`)) {
      try {
        await Promise.all(products.map(product => deleteProduct(product.id)));
        setSelectedProducts(new Set());
        setShowBulkActions(false);
      } catch (error) {
        console.error("Failed to delete products:", error);
      }
    }
  };

  const handleSelectProduct = (productId: string, selected: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (selected) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
      setShowBulkActions(true);
    } else {
      setSelectedProducts(new Set());
      setShowBulkActions(false);
    }
  };

  const handleSubmit = async (productData: FormProduct) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      setShowForm(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleUploadCancel = () => {
    setShowUploadForm(false);
  };

  const handleUploadSubmit = async (productData: FormProduct, category: string, subcategory: string) => {
    try {
      console.log('Starting upload process for:', { category, subcategory, productData });
      
      const validationErrors = validateProductData(productData);
      if (validationErrors.length > 0) {
        alert(`Validation errors:\n${validationErrors.join('\n')}`);
        return;
      }

      const success = await saveProductToDataFolder(productData, category, subcategory);
      if (success) {
        alert(`Product successfully saved to ${category}/${subcategory}`);
        setShowUploadForm(false);
      } else {
        alert("Failed to save product to data folder. Check console for details.");
      }
    } catch (error) {
      console.error("Failed to upload product:", error);
      alert(`Failed to upload product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleSearch = () => {
    search(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    search("");
  };

  // Sync search input with current search term
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Load all unique brands and categories on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [brands, categories] = await Promise.all([
          getAllUniqueBrands(),
          getAllUniqueCategories()
        ]);
        setAllBrands(brands);
        setAllCategories(categories);
      } catch (error) {
        console.error("Failed to load all brands and categories:", error);
      }
    };
    
    loadAllData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage food products, ingredients, and allergen information
          </p>
          {selectedProducts.size > 0 && (
            <p className="mt-1 text-sm text-blue-600">
              {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Upload to Data Folder
          </button>
          <button
            onClick={handleAddNew}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {bulkActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => action.action(filteredAndSortedProducts.filter(p => selectedProducts.has(p.id)))}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      action.destructive
                        ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                        : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setSelectedProducts(new Set());
                  setShowBulkActions(false);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search, Filters, and Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative flex">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search
            </button>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <select
            value={filterBrand}
            onChange={(e) => filterByBrand(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="brand">Brand</option>
              <option value="category">Category</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedProducts.size === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Select All</span>
            </label>
            <span className="text-sm text-gray-500">
              {filteredAndSortedProducts.length} of {total} products
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {filteredAndSortedProducts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || filterBrand || filterCategory ? (
              <>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No products yet</p>
                <p className="text-sm">Get started by adding your first product</p>
              </>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <ProductCard
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="col-span-full flex justify-center py-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  'Load More Products'
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img className="h-10 w-10 rounded-full mr-4" src={product.image_url} alt={product.name} />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category || 'Uncategorized'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{product.barcode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Product Upload Form Modal */}
      {showUploadForm && (
        <ProductUploadForm
          onSubmit={handleUploadSubmit}
          onCancel={handleUploadCancel}
        />
      )}
    </div>
  );
}
