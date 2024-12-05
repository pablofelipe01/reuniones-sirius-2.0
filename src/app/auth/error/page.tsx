// app/auth/error/page.tsx
import { Suspense } from 'react';
import { ErrorContent } from './_components/ErrorContent';

// Server component that provides the structure and Suspense boundary
export default function AuthError() {
  return (
    // Full-screen container with centered content
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Suspense wrapper for the client component */}
      <Suspense 
        fallback={
          // Skeleton UI that matches the error content structure
          <div className="max-w-md w-full p-6 space-y-4 animate-pulse">
            {/* Title skeleton */}
            <div className="h-8 bg-gray-200 rounded w-3/4"/>
            {/* Message skeleton */}
            <div className="h-4 bg-gray-200 rounded w-full mt-4"/>
            {/* Button skeleton */}
            <div className="h-10 bg-gray-200 rounded mt-6"/>
          </div>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  );
}