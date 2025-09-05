"use client";

import { Preference } from "@/types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface PreferenceCardProps {
  preference: Preference;
  onEdit: (preference: Preference) => void;
  onDelete: (preferenceId: string) => void;
}

export default function PreferenceCard({ preference, onEdit, onDelete }: PreferenceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{preference.name}</h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Type: {preference.type}</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {preference.typeId}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Restricted Ingredients:</h4>
        <div className="flex flex-wrap gap-1">
          {preference.ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => onEdit(preference)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(preference.id)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
