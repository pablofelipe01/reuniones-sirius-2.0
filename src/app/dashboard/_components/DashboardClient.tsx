'use client';

import React, { useState, useCallback } from 'react';
import { TaskDashboard } from '@/components/TaskDashboard';
import type { Task } from '@/lib/types';

interface DashboardClientProps {
  initialTasks: Task[];
}

export function DashboardClient({ initialTasks }: DashboardClientProps) {
  // State management for tasks and filters
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Function to filter tasks based on current criteria
  const filteredTasks = tasks.filter(task => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.some(person => 
        person.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Status filter
    const matchesStatus = statusFilter === '' || task.status === statusFilter;

    // Priority filter
    const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handler for task status changes
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      const updatedTask = await response.json();
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Handler for adding comments
  const handleAddComment = async (taskId: string, comment: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const newComment = await response.json();
      
      // Update the task with the new comment
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                comments: [...(task.comments || []), newComment],
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <TaskDashboard 
      tasks={filteredTasks}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      priorityFilter={priorityFilter}
      onPriorityFilterChange={setPriorityFilter}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      onResetFilters={() => {
        setSearchQuery('');
        setStatusFilter('');
        setPriorityFilter('');
      }}
      onStatusChange={handleStatusChange}
      onAddComment={handleAddComment}
    />
  );
}