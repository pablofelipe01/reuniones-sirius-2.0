// src/app/dashboard/__tests__/integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../page';
import { taskService } from '@/lib/tasks';

// Mock the task service
jest.mock('@/lib/tasks');

describe('Dashboard Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('loads and displays tasks correctly', async () => {
    // Mock the task service response
    const mockTasks = [{
      id: '1',
      title: 'Test Task',
      status: 'pendiente',
      priority: 'alta',
      // ... other task properties
    }];

    (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

    render(<Dashboard />);

    // Verify loading state is shown initially
    expect(screen.getByText('Cargando tareas...')).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock an API error
    (taskService.getTasks as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar las tareas/i))
        .toBeInTheDocument();
    });
  });
});