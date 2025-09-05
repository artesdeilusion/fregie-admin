"use client";

import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AuthErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}

export default function AuthErrorDisplay({ error, onDismiss }: AuthErrorDisplayProps) {
  if (!error) return null;

  // Determine if it's an informational error or a critical error
  const isInfoError = error.includes('contact support') || error.includes('not enabled');
  const isNetworkError = error.includes('Network error');

  return (
    <div className={`border rounded-md p-4 ${
      isInfoError 
        ? 'bg-blue-50 border-blue-200' 
        : isNetworkError
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isInfoError ? (
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          ) : (
            <ExclamationTriangleIcon className={`h-5 w-5 ${
              isNetworkError ? 'text-yellow-400' : 'text-red-400'
            }`} />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isInfoError 
              ? 'text-blue-800' 
              : isNetworkError
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            {isInfoError ? 'Information' : isNetworkError ? 'Network Issue' : 'Authentication Error'}
          </h3>
          <div className={`mt-2 text-sm ${
            isInfoError 
              ? 'text-blue-700' 
              : isNetworkError
              ? 'text-yellow-700'
              : 'text-red-700'
          }`}>
            <p>{error}</p>
          </div>
          {isInfoError && (
            <div className="mt-3">
              <div className="text-sm text-blue-700">
                <p className="font-medium">To enable email/password authentication:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to Firebase Console → Authentication</li>
                  <li>Click on "Sign-in method" tab</li>
                  <li>Enable "Email/Password" provider</li>
                  <li>Save the changes</li>
                </ol>
              </div>
            </div>
          )}
          {isNetworkError && (
            <div className="mt-3">
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Troubleshooting steps:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Check if Firebase services are accessible</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isInfoError
                    ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                    : isNetworkError
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                    : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
