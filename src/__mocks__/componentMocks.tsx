// src/__mocks__/componentMocks.tsx
import React from 'react';

// Mock card components
export const Card = ({ children, className }: any) => (
  <div data-testid="mock-card" className={className}>{children}</div>
);

export const CardHeader = ({ children, className }: any) => (
  <div data-testid="mock-card-header" className={className}>{children}</div>
);

export const CardContent = ({ children, className }: any) => (
  <div data-testid="mock-card-content" className={className}>{children}</div>
);

// Mock button component
export const Button = ({ children, onClick, className, variant }: any) => (
  <button 
    data-testid="mock-button"
    onClick={onClick}
    className={className}
  >
    {children}
  </button>
);

// Create a mock module for @/components/ui/card
jest.mock('@/components/ui/card', () => ({
  Card,
  CardHeader,
  CardContent,
}));

// Create a mock module for @/components/ui/button
jest.mock('@/components/ui/button', () => ({
  Button,
}));