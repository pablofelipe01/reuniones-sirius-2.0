// app/login/page.tsx
import { Suspense } from 'react';
import { LoginForm } from './_components/LoginForm';

// This is a server component that provides the main structure and Suspense boundary
export default function LoginPage() {
  return (
    // The outer container provides full-screen centering and background
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Suspense wrapper handles the loading state while the client component hydrates */}
      <Suspense 
        fallback={
          // This skeleton UI matches the structure of the login form for smooth transitions
          <div className="w-full max-w-md p-6 space-y-8 animate-pulse">
            {/* Title skeleton */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"/>
            {/* Subtitle skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"/>
            {/* Form fields skeleton */}
            <div className="space-y-4 mt-8">
              <div className="h-10 bg-gray-200 rounded"/>
              <div className="h-10 bg-gray-200 rounded"/>
            </div>
            {/* Button skeleton */}
            <div className="h-10 bg-gray-200 rounded mt-6"/>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}