"use client";

import { memo } from "react";
import { Product } from "@/types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
// import { cn } from "@/lib/utils"; // Unused import

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard = memo(function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">Brand: {product.brand}</p>
          <p className="text-sm text-gray-600 mb-1">Barcode: {product.barcode}</p>
          {product.net_weight && (
            <p className="text-sm text-gray-600 mb-1">Weight: {product.net_weight}g</p>
          )}
          {product.origin && (
            <p className="text-sm text-gray-600 mb-1">Origin: {product.origin}</p>
          )}
        </div>
        
        {product.image_url && (
          <div className="ml-4">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredients:</h4>
        <div className="flex flex-wrap gap-1">
          {product.ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>

      {product.alergen_warning.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-900 mb-2">Allergen Warnings:</h4>
          <div className="flex flex-wrap gap-1">
            {product.alergen_warning.map((allergen, index) => (
              <span
                key={index}
                className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

              <div className="flex items-center justify-between">
          {product.manufacturer && (
            <div className="text-xs text-gray-500">
              Manufacturer: {product.manufacturer}
            </div>
          )}
          
          <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
