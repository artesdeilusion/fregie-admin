"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { LazyProductsPage, LazyPreferencesPage, LazyAdminPage } from "@/components/LazyComponent";
import DashboardPage from "@/components/DashboardPage";
import ContentManagementPage from "@/components/ContentManagementPage";
import SettingsPage from "@/components/SettingsPage";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import LoginForm from "@/components/LoginForm";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "preferences" | "content" | "admin" | "settings">("dashboard");
  const { user, userRole, loading, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show unauthorized page if user is not admin
  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      
      <main>
        {activeTab === "dashboard" ? (
          <DashboardPage />
        ) : activeTab === "products" ? (
          <LazyProductsPage />
        ) : activeTab === "preferences" ? (
          <LazyPreferencesPage />
        ) : activeTab === "content" ? (
          <ContentManagementPage />
        ) : activeTab === "admin" ? (
          <LazyAdminPage />
        ) : (
          <SettingsPage />
        )}
      </main>
      <PerformanceMonitor />
    </div>
  );
}