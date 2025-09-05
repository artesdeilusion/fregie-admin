"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline"; // CogIcon removed - unused

interface ImportResult {
  success: boolean;
  message: string;
  summary?: {
    totalProducts: number;
    totalSuccess: number;
    totalFailed: number;
    dryRun: boolean;
  };
  results?: { [key: string]: { success: number; failed: number; errors: string[] } };
}

export default function AdminPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dryRun, setDryRun] = useState(true);

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      console.log('Starting import with dryRun:', dryRun);
      
      const response = await fetch('/api/import-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dryRun }),
      });

      const result = await response.json();
      console.log('Import result:', result);
      
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">
          Administrative tools and bulk operations for managing your product database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bulk Import Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Bulk Import Products</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Import all products from your <code className="bg-gray-100 px-2 py-1 rounded">public/data</code> folder structure into your database.
          </p>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="dryRun"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="dryRun" className="text-sm font-medium text-gray-700">
              Dry Run (count products without importing)
            </label>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {dryRun 
              ? "Dry run mode will scan all files and count products without actually importing them. Use this to preview what will be imported."
              : "Live import mode will add all products to your database. This may take a while for large datasets."
            }
          </p>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isImporting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {dryRun ? 'Start Dry Run' : 'Start Import'}
              </>
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold">Quick Stats</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">~6,000</div>
              <div className="text-sm text-gray-600">Total Products Available</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">59</div>
              <div className="text-sm text-gray-600">Product Categories</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">6</div>
              <div className="text-sm text-gray-600">Main Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            {importResult.success ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold">
              {importResult.success ? 'Import Completed' : 'Import Failed'}
            </h2>
          </div>
          
          <p className="text-gray-700 mb-4">{importResult.message}</p>
          
          {importResult.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importResult.summary.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Products Found</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.summary.totalSuccess}</div>
                <div className="text-sm text-gray-600">Successfully Imported</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.summary.totalFailed}</div>
                <div className="text-sm text-gray-600">Failed to Import</div>
              </div>
            </div>
          )}
          
          {importResult.results && Object.keys(importResult.results).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Detailed Results</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {Object.entries(importResult.results).map(([category, result]) => (
                  <div key={category} className="border rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">{category}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">✓ {result.success}</span> successful
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">✗ {result.failed}</span> failed
                      </div>
                    </div>
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-red-600 mb-1">Errors:</div>
                        <ul className="text-xs text-red-600 space-y-1">
                          {result.errors.slice(0, 3).map((error, index) => (
                            <li key={index} className="truncate">{error}</li>
                          ))}
                          {result.errors.length > 3 && (
                            <li className="text-gray-500">... and {result.errors.length - 3} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">How the Import Works</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Scans all directories in <code className="bg-blue-100 px-1 rounded">public/data</code></li>
          <li>Reads each <code className="bg-blue-100 px-1 rounded">products.json</code> file</li>
          <li>Normalizes product data to match your database schema</li>
          <li>Validates required fields (name, brand)</li>
          <li>Generates unique IDs for products without barcodes</li>
          <li>Imports valid products to your database</li>
          <li>Provides detailed results and error reporting</li>
        </ol>
      </div>

      {/* Command Line Alternative */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Command Line Alternative</h3>
        <p className="text-gray-600 mb-4">
          You can also run the import from the command line for more control and detailed output.
        </p>
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="mb-2"># Dry run (count products without importing)</div>
          <div className="text-gray-300">node scripts/import-products.js --dry-run</div>
          <div className="mt-2 mb-2"># Actual import</div>
          <div className="text-gray-300">node scripts/import-products.js</div>
        </div>
      </div>
    </div>
  );
}
