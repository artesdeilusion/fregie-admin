"use client";

import { Suspense, lazy, ComponentType } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LazyComponentProps {
  fallback?: React.ReactNode;
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function WrappedComponent(props: T & LazyComponentProps) {
    const { fallback: propFallback, ...restProps } = props;
    
    return (
      <Suspense fallback={propFallback || fallback || <LoadingSpinner />}>
        <LazyComponent {...(restProps as T)} />
      </Suspense>
    );
  };
}

// Lazy load components
export const LazyProductsPage = withLazyLoading(
  () => import("./EnhancedProductsPage"),
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner />
  </div>
);

export const LazyPreferencesPage = withLazyLoading(
  () => import("./PreferencesPage"),
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner />
  </div>
);

export const LazyAdminPage = withLazyLoading(
  () => import("./AdminPage"),
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner />
  </div>
);

// Generic lazy component wrapper
export default function LazyComponent({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
}
