"use client";

import { useState, useMemo } from "react";
import { Preference, FormPreference } from "@/types";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import EnhancedPreferenceCard from "./EnhancedPreferenceCard";
import EnhancedPreferenceForm from "./EnhancedPreferenceForm";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { usePreferences } from "@/hooks/useFirestore";

export default function EnhancedPreferencesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPreference, setEditingPreference] = useState<Preference | undefined>();
  const [filterType, setFilterType] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { preferences, loading, error, addPreference, updatePreference, deletePreference, refetch } = usePreferences();

  const filteredPreferences = useMemo(() => {
    return preferences.filter((preference) => {
      const matchesSearch = preference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          preference.typeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || preference.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [preferences, searchTerm, filterType]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(preferences.map(p => p.type))).sort();
  }, [preferences]);

  const stats = useMemo(() => {
    const totalPreferences = preferences.length;
    const dietCount = preferences.filter(p => p.type === 'diet').length;
    const allergyCount = preferences.filter(p => p.type === 'allergy').length;
    const totalIngredients = preferences.reduce((sum, p) => sum + p.ingredients.length, 0);
    
    return {
      totalPreferences,
      dietCount,
      allergyCount,
      totalIngredients,
      avgIngredientsPerPreference: totalPreferences > 0 ? Math.round(totalIngredients / totalPreferences) : 0
    };
  }, [preferences]);

  const handleSubmit = async (preferenceData: FormPreference) => {
    try {
      if (editingPreference) {
        await updatePreference(editingPreference.id, preferenceData);
      } else {
        await addPreference(preferenceData);
      }
      setShowForm(false);
      setEditingPreference(undefined);
    } catch (error) {
      console.error("Failed to save preference:", error);
    }
  };

  const handleEdit = (preference: Preference) => {
    setEditingPreference(preference);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingPreference(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPreference(undefined);
  };

  const handleDelete = async (preferenceId: string) => {
    if (confirm("Are you sure you want to delete this preference?")) {
      try {
        await deletePreference(preferenceId);
      } catch (error) {
        console.error("Failed to delete preference:", error);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dietary Preferences</h1>
          <p className="text-gray-600">
            Manage dietary restrictions, allergies, and special diet requirements for your products.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Preference
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TagIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Preferences</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPreferences}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Diet Types</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.dietCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Allergies</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.allergyCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AdjustmentsHorizontalIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ingredients</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalIngredients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search preferences by name or type ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-l-md ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-r-md ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filteredPreferences.length} of {preferences.length} preferences
          </span>
          {(searchTerm || filterType) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("");
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Preferences Display */}
      {filteredPreferences.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || filterType ? (
              <>
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No preferences found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <TagIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No preferences yet</p>
                <p className="text-sm">Get started by adding your first dietary preference</p>
                <button
                  onClick={handleAddNew}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Preference
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredPreferences.map((preference) => (
            <EnhancedPreferenceCard
              key={preference.id}
              preference={preference}
              onEdit={handleEdit}
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Preference Form Modal */}
      {showForm && (
        <EnhancedPreferenceForm
          preference={editingPreference}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
