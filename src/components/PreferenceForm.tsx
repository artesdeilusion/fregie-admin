"use client";

import { useState, useEffect } from "react";
import { Preference, FormPreference } from "@/types";
import { XMarkIcon, PlusIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
// import { cn } from "@/lib/utils"; // Unused import

interface PreferenceFormProps {
  preference?: Preference;
  onSubmit: (preference: FormPreference) => void;
  onCancel: () => void;
}

export default function PreferenceForm({ preference, onSubmit, onCancel }: PreferenceFormProps) {
  const [formData, setFormData] = useState<FormPreference>({
    ingredients: [],
    name: "",
    type: "",
    typeId: "",
  });

  const [newIngredient, setNewIngredient] = useState("");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setJsonData(data);
        } catch {
          alert("Invalid JSON file");
          setJsonFile(null);
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

    // Find the first array in the JSON
    const firstKey = Object.keys(jsonData)[0];
    const ingredients = jsonData[firstKey];

    if (Array.isArray(ingredients)) {
      setFormData({
        ...formData,
        typeId: firstKey,
        ingredients: ingredients,
      });
      
      // Clear the JSON upload state
      setJsonFile(null);
      setJsonData(null);
    } else {
      alert("JSON should contain an array of ingredients");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {preference ? "Edit Preference" : "Add New Preference"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* JSON Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Upload JSON File</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="diet">Diet</option>
                  <option value="allergy">Allergy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preference Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Citric Acid Unfriendly"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                    <strong>JSON Preview:</strong> {Object.keys(jsonData)[0]} ({Array.isArray(jsonData[Object.keys(jsonData)[0]]) ? (jsonData[Object.keys(jsonData)[0]] as unknown[]).length : 0} ingredients)
                  </p>
                  <button
                    type="button"
                    onClick={processJsonData}
                    disabled={!formData.type || !formData.name}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <ArrowUpTrayIcon className="h-4 w-4" />
                    Process JSON Data
                  </button>
                  {(!formData.type || !formData.name) && (
                    <p className="text-xs text-red-500 mt-2">
                      Please select Type and enter Name before processing JSON
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Manual Form Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Manual Entry</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
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
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="diet">Diet</option>
                  <option value="allergy">Allergy</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This will be automatically detected from your JSON file key
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                  placeholder="e.g., citric_acid_unfriendly"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be automatically set from your JSON file key
                </p>
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
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {preference ? "Update Preference" : "Add Preference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
