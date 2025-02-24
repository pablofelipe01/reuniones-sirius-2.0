// src/components/ui/__mocks__/card.tsx
import React from 'react';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card" className={className}>{children}</div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-header" className={className}>{children}</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-content" className={className}>{children}</div>
);