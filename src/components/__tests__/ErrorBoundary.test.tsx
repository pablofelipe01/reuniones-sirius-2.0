// src/components/__tests__/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('displays fallback UI when an error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/intentar de nuevo/i)).toBeInTheDocument();
  });

  it('allows users to recover from errors', async () => {
    const mockReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={mockReset}>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    // Simulate an error
    const error = new Error('Test error');
    ErrorBoundary.getDerivedStateFromError(error);

    // Click the retry button
    screen.getByText(/intentar de nuevo/i).click();
    
    expect(mockReset).toHaveBeenCalled();
  });
});