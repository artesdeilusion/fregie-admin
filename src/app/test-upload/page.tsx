"use client";

import { useState } from "react";
import { FormProduct } from "@/types";
import { saveProductToDataFolder } from "@/lib/dataUtils";

export default function TestUploadPage() {
  const [formData, setFormData] = useState<FormProduct>({
    name: "Test Product",
    brand: "Test Brand",
    barcode: "1234567890123",
    image_url: "",
    ingredients: ["test ingredient"],
    alergen_warning: [],
    manufacturer: "Test Manufacturer",
    net_weight: "100g",
    nutritional_info: "Test nutritional info",
    origin: "TÜRKİYE",
  });

  const [result, setResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("Submitting...");
    
    try {
      console.log('Test form submitted with:', formData);
      
      const success = await saveProductToDataFolder(formData, "atıştırmalık", "bar");
      
      if (success) {
        setResult("Success! Product uploaded.");
      } else {
        setResult("Failed to upload product.");
      }
    } catch (error) {
      console.error('Test upload error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Upload Page</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Barcode</label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Ingredients (comma separated)</label>
          <input
            type="text"
            value={formData.ingredients.join(", ")}
            onChange={(e) => setFormData({ 
              ...formData, 
              ingredients: e.target.value.split(",").map(i => i.trim()).filter(i => i)
            })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Test Upload
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-medium mb-2">Result:</h3>
        <p>{result}</p>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-medium mb-2">Current Form Data:</h3>
        <pre className="text-sm overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
}
