// src/lib/__tests__/data-sync.test.ts
import { taskService } from '../tasks';
import { waitFor } from '@testing-library/react';

describe('Data Synchronization', () => {
  it('successfully syncs task updates with Airtable', async () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      status: 'pendiente'
      // ... other properties
    };

    // Test creating a task
    const createdTask = await taskService.createTask(mockTask);
    expect(createdTask.id).toBeDefined();

    // Test updating the task
    const updatedTask = await taskService.updateTask(createdTask.id, {
      status: 'en_progreso'
    });
    expect(updatedTask.status).toBe('en_progreso');

    // Verify the update is reflected in the database
    const fetchedTask = await taskService.getTask(createdTask.id);
    expect(fetchedTask.status).toBe('en_progreso');
  });

  it('handles concurrent updates correctly', async () => {
    const taskId = '1';
    
    // Simulate multiple simultaneous updates
    const updates = [
      taskService.updateTask(taskId, { status: 'en_progreso' }),
      taskService.updateTask(taskId, { status: 'completada' })
    ];

    await Promise.all(updates);

    // Verify the final state is consistent
    const finalTask = await taskService.getTask(taskId);
    expect(['en_progreso', 'completada']).toContain(finalTask.status);
  });
});