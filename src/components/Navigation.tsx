"use client";

import { 
  BeakerIcon, 
  CubeIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: "dashboard" | "products" | "preferences" | "content";
  onTabChange: (tab: "dashboard" | "products" | "preferences" | "content") => void;
  onLogout?: () => void;
}

export default function Navigation({ activeTab, onTabChange, onLogout }: NavigationProps) {

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: ChartBarIcon,
      description: "Overview and key metrics",
    },
    {
      id: "products",
      name: "Products",
      icon: CubeIcon,
      description: "Manage food products and ingredients",
    },
    {
      id: "preferences",
      name: "Dietary Preferences",
      icon: BeakerIcon,
      description: "Manage dietary restrictions and preferences",
    },
    {
      id: "content",
      name: "Content Management",
      icon: DocumentTextIcon,
      description: "Organize categories and content structure",
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Fregie Admin</h1>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
        
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as "dashboard" | "products" | "preferences" | "content")}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
