"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ChartBarIcon, 
  CubeIcon, 
  BeakerIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { getProductsCount, getPreferencesCount } from "@/lib/firestore";
import LoadingSpinner from "./LoadingSpinner";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState<number>(0);
  const [preferencesCount, setPreferencesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [recentActivity] = useState([
    { id: 1, action: "Added new product", item: "Organic Almond Milk", time: "2 hours ago" },
    { id: 2, action: "Updated preference", item: "Gluten-Free Diet", time: "4 hours ago" },
    { id: 3, action: "Bulk import completed", item: "127 products imported", time: "1 day ago" },
    { id: 4, action: "Created category", item: "Vegan Snacks", time: "2 days ago" },
  ]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [productsCountResult, preferencesCountResult] = await Promise.all([
          getProductsCount(),
          getPreferencesCount()
        ]);
        
        setProductsCount(productsCountResult);
        setPreferencesCount(preferencesCountResult);
      } catch (err) {
        console.error('Dashboard: Error loading counts:', err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, []);

  // Calculate statistics - memoized to prevent unnecessary recalculations
  const stats: StatCard[] = useMemo(() => [
    {
      title: "Total Products",
      value: productsCount,
      change: "+12%",
      changeType: 'positive' as const,
      icon: CubeIcon,
      color: "blue"
    },
    {
      title: "Dietary Preferences",
      value: preferencesCount,
      change: "+3%",
      changeType: 'positive' as const,
      icon: BeakerIcon,
      color: "green"
    },
    {
      title: "Categories",
      value: "N/A", // We'll need to implement a separate count for this
      icon: ChartBarIcon,
      color: "purple"
    },
    {
      title: "Brands",
      value: "N/A", // We'll need to implement a separate count for this
      change: "+8%",
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon,
      color: "orange"
    }
  ], [productsCount, preferencesCount]);

  const quickActions: QuickAction[] = [
    {
      id: "add-product",
      title: "Add Product",
      description: "Create a new product entry",
      icon: PlusIcon,
      action: () => {
        // This would trigger the product form
        console.log("Add product");
      },
      color: "blue"
    },
    {
      id: "bulk-import",
      title: "Bulk Import",
      description: "Import products from data folder",
      icon: ArrowDownTrayIcon,
      action: () => {
        // Navigate to admin tab
        console.log("Bulk import");
      },
      color: "green"
    },
    {
      id: "search-products",
      title: "Search & Filter",
      description: "Find and manage existing products",
      icon: MagnifyingGlassIcon,
      action: () => {
        // Navigate to products with search focus
        console.log("Search products");
      },
      color: "purple"
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Editorial Dashboard</h1>
        <p className="text-gray-600">
          Manage your food database with editorial precision and efficiency.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-md ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  stat.color === 'orange' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    stat.color === 'orange' ? 'text-orange-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <span className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common editorial tasks and workflows</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`p-4 border-2 border-dashed rounded-lg transition-colors text-left ${
                        action.color === 'blue' ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' :
                        action.color === 'green' ? 'border-green-200 hover:border-green-300 hover:bg-green-50' :
                        action.color === 'purple' ? 'border-purple-200 hover:border-purple-300 hover:bg-purple-50' :
                        'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-8 w-8 mb-3 ${
                        action.color === 'blue' ? 'text-blue-600' :
                        action.color === 'green' ? 'text-green-600' :
                        action.color === 'purple' ? 'text-purple-600' :
                        'text-gray-600'
                      }`} />
                      <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Database Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">Products</span>
                      <span className="text-sm font-medium text-gray-500">{productsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">Preferences</span>
                      <span className="text-sm font-medium text-gray-500">{preferencesCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">Load Time</span>
                      <span className="text-sm font-medium text-green-600">Optimized</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900">Memory Usage</span>
                      <span className="text-sm font-medium text-green-600">Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>
                      </p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Backup</span>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Usage</span>
                  <span className="text-xs text-gray-500">2.3 GB / 10 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
