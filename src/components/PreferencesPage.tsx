"use client";

import { useState, useMemo } from "react";
import { Preference, FormPreference } from "@/types";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import PreferenceCard from "./PreferenceCard";
import PreferenceForm from "./PreferenceForm";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { usePreferences } from "@/hooks/useFirestore";

export default function PreferencesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPreference, setEditingPreference] = useState<Preference | undefined>();
  const [filterType, setFilterType] = useState("");

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dietary Preferences</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage dietary restrictions, allergies, and food preferences
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

      {/* Search and Filters */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search preferences by name or type ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Preferences Grid */}
      {filteredPreferences.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || filterType ? (
              <>
                <p className="text-lg font-medium">No preferences found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No preferences yet</p>
                <p className="text-sm">Get started by adding your first dietary preference</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPreferences.map((preference) => (
            <PreferenceCard
              key={preference.id}
              preference={preference}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Preference Form Modal */}
      {showForm && (
        <PreferenceForm
          preference={editingPreference}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
