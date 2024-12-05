'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task } from '@/lib/types';

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return (
    <div className="text-center py-8 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4">
      Loading...
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-red-500">
      {error}
    </div>
  );

  return (
    <div className="space-y-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Tareas</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border border-gray-200">
          <div>
            <Input
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 p-2 w-full bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completada</option>
            <option value="aceptada">Aceptada</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-gray-300 p-2 w-full bg-white"
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg">
            No se encontraron tareas que coincidan con los filtros
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              onEditTask={task => {
                console.log('Editing task:', task);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}