"use client";

import { useState, useMemo } from "react";
import { Product, FormProduct } from "@/types";
import { MagnifyingGlassIcon, PlusIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import ProductUploadForm from "./ProductUploadForm";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { useProducts } from "@/hooks/useFirestore";
import { saveProductToDataFolder, validateProductData } from "@/lib/dataUtils";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [filterBrand, setFilterBrand] = useState("");

  const { products, loading, error, addProduct, updateProduct, deleteProduct, refetch } = useProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.barcode.includes(searchTerm);
      const matchesBrand = !filterBrand || product.brand === filterBrand;
      return matchesSearch && matchesBrand;
    });
  }, [products, searchTerm, filterBrand]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, [products]);

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
      
      // Validate the product data
      const validationErrors = validateProductData(productData);
      if (validationErrors.length > 0) {
        alert(`Validation errors:\n${validationErrors.join('\n')}`);
        return;
      }

      // Save to data folder
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage food products, ingredients, and allergen information
          </p>
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

      {/* Search and Filters */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name, brand, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Brands</option>
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || filterBrand ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
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
