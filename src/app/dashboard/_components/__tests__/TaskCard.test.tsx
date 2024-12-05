// src/app/dashboard/_components/__tests__/TaskCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimpleTaskCard } from '../SimpleTaskCard';  // We'll create this file next
import type { Task } from '@/lib/types';

// First, let's set up our mock data
const mockTask: Task = {
  id: '1',
  title: 'Implementar nueva funcionalidad',
  status: 'pendiente',
  priority: 'alta',
  deadline: '2024-03-15T00:00:00.000Z',
  assignedTo: ['Pablo Acebedo'],
  createdBy: 'David Hernández',
  comments: [],
  createdAt: '2024-03-10T00:00:00.000Z',
  updatedAt: '2024-03-10T00:00:00.000Z',
};

// Now we'll organize our tests into logical groups
describe('SimpleTaskCard', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    it('renders basic task information correctly', () => {
      render(<SimpleTaskCard task={mockTask} />);
      
      expect(screen.getByTestId('task-title')).toHaveTextContent(mockTask.title);
      expect(screen.getByTestId('task-status')).toHaveTextContent(mockTask.status);
      expect(screen.getByTestId('task-priority')).toHaveTextContent(mockTask.priority);
      expect(screen.getByTestId('task-assignee')).toHaveTextContent(mockTask.assignedTo[0]);
      expect(screen.getByTestId('task-creator')).toHaveTextContent(mockTask.createdBy);
    });

    it('displays loading state when isLoading is true', () => {
      render(<SimpleTaskCard task={mockTask} isLoading={true} />);
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  // Status update tests
  describe('Status Updates', () => {
    it('handles successful status updates', async () => {
      const handleStatusChange = jest.fn().mockResolvedValue(undefined);
      render(<SimpleTaskCard task={mockTask} onStatusChange={handleStatusChange} />);

      fireEvent.click(screen.getByTestId('status-button'));
      expect(handleStatusChange).toHaveBeenCalledWith(mockTask.id, 'en_progreso');
    });

    it('displays error message on status update failure', async () => {
      const handleStatusChange = jest.fn().mockRejectedValue(new Error('Update failed'));
      render(<SimpleTaskCard task={mockTask} onStatusChange={handleStatusChange} />);

      fireEvent.click(screen.getByTestId('status-button'));
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Error updating status');
      });
    });

    it('disables the status button while updating', async () => {
      const handleStatusChange = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      render(<SimpleTaskCard task={mockTask} onStatusChange={handleStatusChange} />);

      const button = screen.getByTestId('status-button');
      fireEvent.click(button);
      expect(button).toBeDisabled();
      
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  // Comment functionality tests
  describe('Comments', () => {
    it('toggles comment visibility correctly', () => {
      render(<SimpleTaskCard task={mockTask} />);
      
      expect(screen.queryByTestId('comments-section')).not.toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('toggle-comments'));
      expect(screen.getByTestId('comments-section')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('toggle-comments'));
      expect(screen.queryByTestId('comments-section')).not.toBeInTheDocument();
    });

    it('handles comment submission', async () => {
      const handleCommentAdd = jest.fn().mockResolvedValue(undefined);
      render(<SimpleTaskCard task={mockTask} onCommentAdd={handleCommentAdd} />);

      // Open comments section
      fireEvent.click(screen.getByTestId('toggle-comments'));
      
      // Add a comment
      const input = screen.getByTestId('comment-input');
      fireEvent.change(input, { target: { value: 'New comment' } });
      fireEvent.click(screen.getByTestId('submit-comment'));

      expect(handleCommentAdd).toHaveBeenCalledWith(mockTask.id, 'New comment');
      
      // Input should be cleared after submission
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('maintains comment input state when toggling visibility', () => {
      render(<SimpleTaskCard task={mockTask} />);
      
      // Show comments and type
      fireEvent.click(screen.getByTestId('toggle-comments'));
      const input = screen.getByTestId('comment-input');
      fireEvent.change(input, { target: { value: 'Draft comment' } });
      
      // Hide and show comments
      fireEvent.click(screen.getByTestId('toggle-comments'));
      fireEvent.click(screen.getByTestId('toggle-comments'));
      
      // Input value should persist
      expect(screen.getByTestId('comment-input')).toHaveValue('Draft comment');
    });
  });
});