// src/__mocks__/components/ui/card.tsx
import React from 'react';

// Create simple mock implementations of the card components
export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card" className={className}>{children}</div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-header" className={className}>{children}</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-content" className={className}>{children}</div>
);

// Export all components as a module
export default {
  Card,
  CardHeader,
  CardContent
};