// This file contains utility functions used throughout the application
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// The cn function combines multiple class names and handles Tailwind conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to format dates in Spanish
export function formatDate(date: string | null): string {
  if (!date) return 'No especificada';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Utility function to get appropriate color classes for priority levels
export function getPriorityColor(priority: 'alta' | 'media' | 'baja'): string {
  const colors = {
    alta: 'bg-red-100 text-red-800',
    media: 'bg-yellow-100 text-yellow-800',
    baja: 'bg-green-100 text-green-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

// Utility function to get appropriate color classes for task statuses
export function getStatusColor(status: 'pendiente' | 'en_progreso' | 'completada' | 'rechazada'): string {
  const colors = {
    pendiente: 'bg-gray-100 text-gray-800',
    en_progreso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}