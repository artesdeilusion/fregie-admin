"use client";

import { useState, useEffect } from "react";
import { Product, FormProduct } from "@/types";
import { XMarkIcon, PlusIcon, ArrowUpTrayIcon, FolderIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { bulkUploadProducts } from "@/lib/dataUtils";

interface ProductUploadFormProps {
  onSubmit: (product: FormProduct, category: string, subcategory: string) => void;
  onCancel: () => void;
}

interface Category {
  name: string;
  path: string;
  subcategories: string[];
}

export default function ProductUploadForm({ onSubmit, onCancel }: ProductUploadFormProps) {
  const [formData, setFormData] = useState<FormProduct>({
    alergen_warning: [],
    barcode: "",
    brand: "",
    image_url: "",
    ingredients: [],
    manufacturer: "",
    name: "",
    net_weight: "",
    nutritional_info: "",
    origin: "",
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newAllergen, setNewAllergen] = useState("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");

  // Define the category structure based on your public/data folder
  const categories: Category[] = [
    {
      name: "Atıştırmalık",
      path: "atıştırmalık",
      subcategories: ["bar", "bisküvi", "cikolata", "cips", "gofret", "i̇kramlıklar", "kek", "kraker", "kuru_meyve", "kuru_yemiş", "sakız", "şekerleme"]
    },
    {
      name: "İçecek",
      path: "icecek",
      subcategories: ["cay", "gazlı_icecek", "gazsız_icecek", "günlük_icecek", "kahve", "kombucha_ve_malt_icecek", "maden_suyu", "su"]
    },
    {
      name: "Süt Ürünleri ve Kahvaltılık",
      path: "süt_ürünleri_ve_kahvaltılık",
      subcategories: ["dondurma", "kahvaltılıklar", "margarin", "peynir", "süt", "sütlü_tatlılar_ve_krema", "tereyağı", "yoğurt"]
    },
    {
      name: "Temel Gıda",
      path: "temel_gıda",
      subcategories: ["bakliyat_ve_pirinc", "corba_ve_bulyonlar", "hazır_yemek", "konserve,_salca_ve_turşu", "makarna", "mayalar", "şeker", "sıvı_yağlar", "soslar", "tuz,_baharat_ve_harc", "un_ve_irmik"]
    },
    {
      name: "Unlu Mamul ve Tatlı",
      path: "unlu_mamul_ve_tatlı",
      subcategories: ["börekler", "dondurulmuş", "ekmek", "galetta_ve_grissini_ve_gevrek", "hamur_ve_pasta_malzemeleri", "pasta_ve_kek_ceşitleri", "tatlılar", "toz_tatlılar", "yufka_ve_erişte"]
    },
    {
      name: "Yaşam ve Beslenme Tarzı",
      path: "yaşam_ve_beslenme_tarzı",
      subcategories: ["aktif_yaşam", "bar", "glutensiz", "kafeinsiz", "kolajen", "laktozsuz", "organik", "probiyotik", "şekersiz_tatlandırıcılar", "süper_gıdalar", "vegan_ve_vejetaryen"]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubcategory) {
      alert("Please select both category and subcategory");
      return;
    }
    
    console.log('Form submitted with:', {
      formData,
      selectedCategory,
      selectedSubcategory
    });
    
    onSubmit(formData, selectedCategory, selectedSubcategory);
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !formData.alergen_warning.includes(newAllergen.trim())) {
      setFormData({
        ...formData,
        alergen_warning: [...formData.alergen_warning, newAllergen.trim()],
      });
      setNewAllergen("");
    }
  };

  const removeAllergen = (index: number) => {
    setFormData({
      ...formData,
      alergen_warning: formData.alergen_warning.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setJsonData(data);
        } catch (error) {
          alert("Invalid JSON file");
          setJsonFile(null);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid JSON file");
    }
  };

  const processBulkUpload = async () => {
    if (!selectedCategory || !selectedSubcategory || !jsonData) {
      alert("Please select category, subcategory, and provide JSON data");
      return;
    }

    if (Array.isArray(jsonData)) {
      try {
        // Process array of products
        const processedProducts: FormProduct[] = jsonData.map((product) => ({
          name: product.name || product["﻿name"] || "",
          brand: product.brand || "",
          barcode: product.barcode || "",
          image_url: product.image_url || "",
          ingredients: Array.isArray(product.ingredients) ? product.ingredients : [product.ingredients || ""],
          alergen_warning: Array.isArray(product.alergen_warning) ? product.alergen_warning : [product.allergen_warning || ""],
          net_weight: product.net_weight || "",
          nutritional_info: product.nutritional_info || "",
          manufacturer: product.manufacturer || "",
          origin: product.origin || "",
        }));
        
        // Use bulk upload function
        const success = await bulkUploadProducts(processedProducts, selectedCategory, selectedSubcategory);
        
        if (success) {
          alert(`Successfully uploaded ${processedProducts.length} products to ${selectedCategory}/${selectedSubcategory}`);
          // Clear the form
          setJsonFile(null);
          setJsonData(null);
        } else {
          alert("Failed to upload products");
        }
      } catch (error) {
        console.error('Error processing bulk upload:', error);
        alert("Error processing bulk upload");
      }
    } else {
      alert("JSON should contain an array of products");
    }
  };

  const handleCategoryChange = (categoryPath: string) => {
    setSelectedCategory(categoryPath);
    setSelectedSubcategory(""); // Reset subcategory when category changes
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Upload Products to Data Folder
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Upload Mode Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setUploadMode("single")}
              className={cn(
                "px-4 py-2 rounded-md font-medium",
                uploadMode === "single"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Single Product
            </button>
            <button
              onClick={() => setUploadMode("bulk")}
              className={cn(
                "px-4 py-2 rounded-md font-medium",
                uploadMode === "bulk"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Bulk Upload (JSON)
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Select Category & Subcategory</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.path} value={category.path}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              <select
                required
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Subcategory</option>
                {selectedCategory && categories
                  .find(cat => cat.path === selectedCategory)
                  ?.subcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat.replace(/_/g, " ")}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {uploadMode === "single" ? (
          /* Single Product Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Net Weight (g)
                </label>
                <input
                  type="text"
                  value={formData.net_weight}
                  onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nutritional Information
              </label>
              <textarea
                value={formData.nutritional_info}
                onChange={(e) => setFormData({ ...formData, nutritional_info: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergen Warnings
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="Add allergen"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergen())}
                />
                <button
                  type="button"
                  onClick={addAllergen}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.alergen_warning.map((allergen, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Upload Product
              </button>
            </div>
          </form>
        ) : (
          /* Bulk Upload Form */
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload JSON File</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {jsonData && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>JSON Preview:</strong> {Array.isArray(jsonData) ? `${jsonData.length} products` : 'Invalid format'}
                    </p>
                    <button
                      type="button"
                      onClick={processBulkUpload}
                      disabled={!selectedCategory || !selectedSubcategory}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Process Bulk Upload
                    </button>
                    {(!selectedCategory || !selectedSubcategory) && (
                      <p className="text-xs text-red-500 mt-2">
                        Please select both Category and Subcategory before processing
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
