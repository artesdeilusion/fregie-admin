"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  FolderIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import { useProducts } from "@/hooks/useFirestore";
import { 
  addCategory, 
  updateCategory, 
  deleteCategory,
  getCategories, 
  CategoryData 
} from "@/lib/firestore";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";

interface Category {
  name: string;
  productCount: number;
  subcategories: string[];
}

interface CategoryFormData {
  name: string;
  level: 'category' | 'subcategory';
  parentId?: string;
}

export default function ContentManagementPage() {
  const { products, loading } = useProducts();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    level: 'category'
  });
  const [savedCategories, setSavedCategories] = useState<CategoryData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Show 10 categories per page

  // Load saved categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading saved categories from Firebase...');
        const categories = await getCategories();
        console.log('Loaded categories:', categories);
        setSavedCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Analyze existing categories from products
  const analyzedCategories = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    
    products.forEach(product => {
      const categoryName = product.category || 'Uncategorized';
      const subcategoryName = product.subcategory || 'General';
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          productCount: 0,
          subcategories: []
        });
      }
      
      const category = categoryMap.get(categoryName)!;
      category.productCount++;
      
      if (!category.subcategories.includes(subcategoryName)) {
        category.subcategories.push(subcategoryName);
      }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.productCount - a.productCount);
  }, [products]);

  // Combine saved categories with analyzed categories
  const categories = useMemo(() => {
    console.log('Combining categories - analyzed:', analyzedCategories.length, 'saved:', savedCategories.length);
    
    const combinedCategories = new Map<string, Category>();
    
    // Add analyzed categories from products
    analyzedCategories.forEach(cat => {
      combinedCategories.set(cat.name, cat);
    });
    
    // Add saved categories from Firebase (if not already present)
    savedCategories.forEach(savedCat => {
      if (!combinedCategories.has(savedCat.name)) {
        console.log('Adding saved category:', savedCat.name);
        combinedCategories.set(savedCat.name, {
          name: savedCat.name,
          productCount: 0,
          subcategories: []
        });
      }
    });
    
    const result = Array.from(combinedCategories.values()).sort((a, b) => b.productCount - a.productCount);
    console.log('Final combined categories:', result.length, result.map(c => c.name));
    return result;
  }, [analyzedCategories, savedCategories]);

  // Pagination logic for categories
  const totalCategories = categories.length;
  const totalPages = Math.ceil(totalCategories / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCategories);
  const paginatedCategories = categories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!categoryFormData.name.trim()) {
      alert('Please enter a category name.');
      return;
    }
    
    if (categoryFormData.level === 'subcategory' && !categoryFormData.parentId) {
      alert('Please select a parent category for the subcategory.');
      return;
    }
    
    try {
      console.log('Submitting category data:', categoryFormData);
      
      if (editingCategoryId) {
        // Update existing category
        console.log('Updating category with ID:', editingCategoryId);
        await updateCategory(editingCategoryId, {
          name: categoryFormData.name.trim(),
          level: categoryFormData.level,
          parentId: categoryFormData.parentId
        });
        console.log('Category updated successfully');
      } else {
        // Add new category
        console.log('Adding new category');
        const newCategoryId = await addCategory({
          name: categoryFormData.name.trim(),
          level: categoryFormData.level,
          parentId: categoryFormData.parentId
        });
        console.log('Category added successfully with ID:', newCategoryId);
      }
      
      // Refresh categories
      console.log('Refreshing categories list');
      const updatedCategories = await getCategories();
      setSavedCategories(updatedCategories);
      console.log('Categories refreshed:', updatedCategories.length, 'categories');
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      setEditingCategoryId(null);
      setCategoryFormData({ name: '', level: 'category' });
      console.log('Form reset and modal closed');
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Error saving category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setCategoryFormData({
      name: categoryName,
      level: 'category'
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? This will not delete the products, but they will become uncategorized.`)) {
      try {
        // Find the category in saved categories to get its ID
        const savedCategory = savedCategories.find(cat => cat.name === categoryName);
        
        if (!savedCategory || !savedCategory.id) {
          alert('Cannot delete this category. It may be derived from existing products and not saved in the database.');
          return;
        }
        
        console.log('Deleting category:', categoryName, 'with ID:', savedCategory.id);
        await deleteCategory(savedCategory.id);
        
        // Refresh categories
        console.log('Refreshing categories after deletion');
        const updatedCategories = await getCategories();
        setSavedCategories(updatedCategories);
        console.log('Categories refreshed after deletion:', updatedCategories.length, 'categories');
        
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(`Error deleting category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">
            Organize and structure your product catalog for better editorial control.
          </p>
        </div>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FolderIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Subcategories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AdjustmentsHorizontalIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Products/Category</p>
              <p className="text-2xl font-semibold text-gray-900">
                {categories.length > 0 ? Math.round(products.length / categories.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                Sort
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {paginatedCategories.map((category) => (
            <div key={category.name} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <FolderIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {category.productCount} products
                        </span>
                        <span className="text-sm text-gray-500">
                          {category.subcategories.length} subcategories
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {category.subcategories.length > 0 && (
                    <div className="mt-3 ml-8">
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((subcategory) => (
                          <span
                            key={subcategory}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {subcategory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {savedCategories.find(cat => cat.name === category.name) ? (
                    // This is a saved category - can be edited and deleted
                    <>
                      <button
                        onClick={() => handleEditCategory(category.name)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit category"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.name)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    // This is an analyzed category from products - cannot be edited/deleted
                    <span className="text-xs text-gray-500 italic">
                      From products
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalCategories > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
            total={totalCategories}
            loading={loading}
          />
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-4">
                  <label htmlFor="categoryLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Level
                  </label>
                  <select
                    id="categoryLevel"
                    value={categoryFormData.level}
                    onChange={(e) => setCategoryFormData({ 
                      ...categoryFormData, 
                      level: e.target.value as 'category' | 'subcategory',
                      parentId: e.target.value === 'category' ? undefined : categoryFormData.parentId
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="category">Main Category</option>
                    <option value="subcategory">Subcategory</option>
                  </select>
                </div>

                {categoryFormData.level === 'subcategory' && (
                  <div className="mb-4">
                    <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Category
                    </label>
                    <select
                      id="parentCategory"
                      value={categoryFormData.parentId || ''}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, parentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a parent category</option>
                      {savedCategories
                        .filter(cat => cat.level === 'category')
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                    {categoryFormData.level === 'subcategory' ? 'Subcategory' : 'Category'} Name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                      setEditingCategoryId(null);
                      setCategoryFormData({ name: '', level: 'category' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingCategory ? 'Update' : 'Create'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
