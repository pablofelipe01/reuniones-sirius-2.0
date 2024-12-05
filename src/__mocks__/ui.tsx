// src/__mocks__/ui.tsx
import React from 'react';

// These components mimic the structure of our UI components but in a simplified form for testing
export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card" className={className}>{children}</div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-header" className={className}>{children}</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-content" className={className}>{children}</div>
);

export const Button = ({ 
  children, 
  onClick,
  className,
  variant = 'default'
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: string;
}) => (
  <button
    data-testid="button"
    onClick={onClick}
    className={className}
  >
    {children}
  </button>
);