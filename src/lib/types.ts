// src/lib/types.ts
// Core type definitions for our task management system
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'rechazada';
export type TaskPriority = 'alta' | 'media' | 'baja';

// Comprehensive comment interface to handle all comment-related data
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  taskId: string;
  // Adding edited status for future editing functionality
  edited?: boolean;
  editedAt?: string;
}

// Complete task interface with all necessary properties
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  assignedTo: string[];
  createdBy: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}