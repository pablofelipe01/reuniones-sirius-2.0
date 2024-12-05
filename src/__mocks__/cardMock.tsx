// src/__mocks__/cardMock.tsx
import React from 'react';

// Creating simple mock implementations that just render their children
export const Card = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="card">{children}</div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="card-header">{children}</div>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="card-content">{children}</div>
);