// src/app/dashboard/_components/SimpleTaskCard.tsx
import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Define the props interface for type safety and documentation
interface SimpleTaskCardProps {
  task: Task;
  onStatusChange?: (id: string, status: string) => Promise<void>;
  onCommentAdd?: (id: string, comment: string) => Promise<void>;
  isLoading?: boolean;
}

export function SimpleTaskCard({ 
  task, 
  onStatusChange, 
  onCommentAdd,
  isLoading = false,
}: SimpleTaskCardProps) {
  // State management for component features
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show loading state when data is being fetched
  if (isLoading) {
    return <div data-testid="loading-state">Loading...</div>;
  }

  // Handle status changes (e.g., moving from 'pending' to 'in progress')
  const handleStatusChange = async () => {
    if (!onStatusChange) return;
    
    try {
      setUpdating(true);
      setError(null);
      // Calculate the next status based on current status
      const nextStatus = task.status === 'pendiente' ? 'en_progreso' : 'completada';
      await onStatusChange(task.id, nextStatus);
    } catch (err) {
      setError('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle new comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCommentAdd || !newComment.trim()) return;

    try {
      setUpdating(true);
      setError(null);
      await onCommentAdd(task.id, newComment);
      setNewComment(''); // Clear input after successful submission
    } catch (err) {
      setError('Error adding comment');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div data-testid="task-card" className="p-4 border rounded-lg shadow-sm">
      {/* Error message display */}
      {error && (
        <div data-testid="error-message" className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Task title and basic information */}
      <h2 data-testid="task-title" className="text-xl font-semibold mb-2">
        {task.title}
      </h2>
      
      {/* Task metadata section */}
      <div data-testid="task-metadata" className="space-y-2 mb-4">
        <p>
          Status: <span data-testid="task-status" className="font-medium">{task.status}</span>
        </p>
        <p>
          Priority: <span data-testid="task-priority" className="font-medium">{task.priority}</span>
        </p>
        <p>
          Assigned to: <span data-testid="task-assignee" className="font-medium">
            {task.assignedTo.join(', ')}
          </span>
        </p>
        <p>
          Created by: <span data-testid="task-creator" className="font-medium">
            {task.createdBy}
          </span>
        </p>
        <p>
          Deadline: <span data-testid="task-deadline" className="font-medium">
            {formatDate(task.deadline)}
          </span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-x-2 mb-4">
        <button 
          data-testid="status-button"
          onClick={handleStatusChange}
          disabled={updating}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {updating ? 'Updating...' : 'Update Status'}
        </button>

        <button 
          data-testid="toggle-comments"
          onClick={() => setShowComments(!showComments)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded"
        >
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div data-testid="comments-section" className="space-y-4">
          {/* Existing comments */}
          <div className="space-y-2">
            {task.comments.map(comment => (
              <div 
                key={comment.id} 
                data-testid="comment"
                className="p-2 bg-gray-50 rounded"
              >
                {comment.content}
              </div>
            ))}
          </div>

          {/* New comment form */}
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <input
              data-testid="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              disabled={updating}
              className="w-full p-2 border rounded"
            />
            <button 
              type="submit" 
              data-testid="submit-comment"
              disabled={updating || !newComment.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-green-300"
            >
              {updating ? 'Adding...' : 'Add Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}