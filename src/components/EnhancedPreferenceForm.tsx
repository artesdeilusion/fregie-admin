"use client";

import { useState, useEffect } from "react";
import { Preference, FormPreference } from "@/types";
import { 
  XMarkIcon, 
  PlusIcon, 
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

interface EnhancedPreferenceFormProps {
  preference?: Preference;
  onSubmit: (preference: FormPreference) => void;
  onCancel: () => void;
}

export default function EnhancedPreferenceForm({ preference, onSubmit, onCancel }: EnhancedPreferenceFormProps) {
  const [formData, setFormData] = useState<FormPreference>({
    ingredients: [],
    name: "",
    type: "",
    typeId: "",
  });

  const [newIngredient, setNewIngredient] = useState("");
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'json'>('manual');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preference) {
      setFormData({
        ingredients: [...preference.ingredients],
        name: preference.name,
        type: preference.type,
        typeId: preference.typeId,
      });
    }
  }, [preference]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    if (!formData.typeId.trim()) {
      newErrors.typeId = "Type ID is required";
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients.includes(newIngredient.trim())) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
      if (errors.ingredients) {
        setErrors({ ...errors, ingredients: "" });
      }
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setJsonData(data);
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid JSON file");
    }
  };

  const processJsonData = () => {
    if (!jsonData || !formData.type || !formData.name.trim()) {
      alert("Please provide Type, Name, and JSON data");
      return;
    }

    const firstKey = Object.keys(jsonData)[0];
    const ingredients = jsonData[firstKey];

    if (Array.isArray(ingredients)) {
      setFormData({
        ...formData,
        typeId: firstKey,
        ingredients: ingredients,
      });
      
      setJsonData(null);
      setActiveTab('manual');
    } else {
      alert("JSON should contain an array of ingredients");
    }
  };

  const generateTypeId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!formData.typeId || formData.typeId === generateTypeId(formData.name)) {
      setFormData(prev => ({ ...prev, name, typeId: generateTypeId(name) }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {preference ? "Edit Preference" : "Add New Preference"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {preference ? "Update the dietary preference details" : "Create a new dietary preference or allergy"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4 inline mr-2" />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'json'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowUpTrayIcon className="h-4 w-4 inline mr-2" />
            JSON Upload
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preference Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Citric Acid Unfriendly"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="diet">Diet</option>
                  <option value="allergy">Allergy</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type ID *
              </label>
              <input
                type="text"
                required
                value={formData.typeId}
                onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                placeholder="e.g., citric_acid_unfriendly"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.typeId ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.typeId && (
                <p className="mt-1 text-sm text-red-600">{errors.typeId}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Used for programmatic identification. Use lowercase letters, numbers, and underscores only.
              </p>
            </div>
          </div>

          {/* JSON Upload Tab */}
          {activeTab === 'json' && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">JSON Upload</h4>
              </div>
              
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
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a JSON file with ingredients array. The key will be used as Type ID.
                  </p>
                </div>

                {jsonData && (
                  <div className="bg-white p-4 rounded border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          <strong>JSON Preview:</strong> {Object.keys(jsonData)[0]}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Array.isArray(jsonData[Object.keys(jsonData)[0]]) 
                            ? `${(jsonData[Object.keys(jsonData)[0]] as unknown[]).length} ingredients found`
                            : 'Invalid format - should be an array'
                          }
                        </p>
                      </div>
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <button
                      type="button"
                      onClick={processJsonData}
                      disabled={!formData.type || !formData.name}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Process JSON Data
                    </button>
                    {(!formData.type || !formData.name) && (
                      <p className="text-xs text-red-500 mt-2 text-center">
                        Please fill in Type and Name before processing JSON
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Entry Tab */}
          {activeTab === 'manual' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ingredients</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Ingredient
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="Enter ingredient name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                    />
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {formData.ingredients.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Ingredients ({formData.ingredients.length})
                      </label>
                      {errors.ingredients && (
                        <p className="text-sm text-red-600">{errors.ingredients}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {formData.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full border border-red-200"
                        >
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {preference ? "Update Preference" : "Add Preference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
