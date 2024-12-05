import { GET, POST } from '@/app/api/tasks/route';
import { taskService } from '@/lib/tasks';
import type { Task } from '@/lib/types';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      });
    },
  },
}));

// Mock taskService
jest.mock('@/lib/tasks', () => ({
  taskService: {
    getTasks: jest.fn(),
    createTask: jest.fn()
  }
}));

// Mock data
const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  status: 'pendiente',
  priority: 'alta',
  deadline: '2024-03-15T00:00:00.000Z',
  assignedTo: ['Test User'],
  createdBy: 'Test Creator',
  comments: [],
  createdAt: '2024-03-10T00:00:00.000Z',
  updatedAt: '2024-03-10T00:00:00.000Z',
};

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('returns tasks successfully', async () => {
      (taskService.getTasks as jest.Mock).mockResolvedValue([mockTask]);
      
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockTask]);
      expect(taskService.getTasks).toHaveBeenCalled();
    });

    it('handles errors appropriately', async () => {
      (taskService.getTasks as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch tasks' });
    });
  });

  describe('POST /api/tasks', () => {
    it('creates a task successfully', async () => {
      const newTaskData = {
        title: 'New Task',
        status: 'pendiente' as const,
        priority: 'alta' as const,
      };

      (taskService.createTask as jest.Mock).mockResolvedValue({
        ...mockTask,
        ...newTaskData,
      });

      const request = new Request('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTaskData),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(taskService.createTask).toHaveBeenCalledWith(newTaskData);
      expect(data).toMatchObject(newTaskData);
    });
  });
});