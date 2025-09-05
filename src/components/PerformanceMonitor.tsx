"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  renderCount: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    renderCount: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // Measure memory usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
        if (memory) {
          const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
          setMetrics(prev => ({ ...prev, memoryUsage }));
        }
      }
    };

    // Initial measurements
    measureLoadTime();
    measureMemory();

    // Update render count
    setMetrics(prev => ({ ...prev, renderCount: prev.renderCount + 1 }));

    // Cleanup
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono">
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      <div>Renders: {metrics.renderCount}</div>
    </div>
  );
}