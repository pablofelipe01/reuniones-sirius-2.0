// src/__mocks__/components/ui/card.tsx
import React from 'react';

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="card">{children}</div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="card-header">{children}</div>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="card-content">{children}</div>
);