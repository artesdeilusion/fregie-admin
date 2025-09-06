"use client";

import { Preference } from "@/types";
import { 
  PencilIcon, 
  TrashIcon, 
  HeartIcon, 
  ExclamationTriangleIcon,
  TagIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface EnhancedPreferenceCardProps {
  preference: Preference;
  onEdit: (preference: Preference) => void;
  onDelete: (preferenceId: string) => void;
  viewMode?: 'grid' | 'list';
}

export default function EnhancedPreferenceCard({ 
  preference, 
  onEdit, 
  onDelete, 
  viewMode = 'grid' 
}: EnhancedPreferenceCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'diet':
        return <HeartIcon className="h-5 w-5 text-green-600" />;
      case 'allergy':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <TagIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'diet':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'allergy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTypeId = (typeId: string) => {
    return typeId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              {getTypeIcon(preference.type)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {preference.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(preference.type)}`}>
                    {preference.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTypeId(preference.typeId)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Restricted Ingredients ({preference.ingredients.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {preference.ingredients.slice(0, 8).map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded-md border border-red-200"
                  >
                    {ingredient}
                  </span>
                ))}
                {preference.ingredients.length > 8 && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                    +{preference.ingredients.length - 8} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(preference)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit preference"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(preference.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete preference"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getTypeIcon(preference.type)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {preference.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(preference.type)}`}>
                {preference.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">
            Restricted Ingredients
          </h4>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {preference.ingredients.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {preference.ingredients.slice(0, 6).map((ingredient, index) => (
            <span
              key={index}
              className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded-md border border-red-200"
            >
              {ingredient}
            </span>
          ))}
          {preference.ingredients.length > 6 && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
              +{preference.ingredients.length - 6}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Type ID</div>
        <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded border">
          {preference.typeId}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="h-3 w-3 mr-1" />
          {preference.ingredients.length} ingredients
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(preference)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit preference"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(preference.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete preference"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
