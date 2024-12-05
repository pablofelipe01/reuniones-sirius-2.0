// src/lib/__tests__/tasks.test.ts
import { taskService } from '../tasks';
import { MockAirtable, mockAirtableResponse } from '../../__mocks__/airtableSetup';

// Mock the Airtable module
jest.mock('airtable', () => MockAirtable);

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('fetches and formats tasks correctly', async () => {
      const tasks = await taskService.getTasks();
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({
        id: mockAirtableResponse.id,
        title: mockAirtableResponse.fields['Titulo'],
        status: mockAirtableResponse.fields['Estado'],
        priority: mockAirtableResponse.fields['Prioridad'],
      });
    });

    it('handles errors gracefully', async () => {
      // Mock a failure
      MockAirtable.mockImplementationOnce(() => {
        throw new Error('Airtable error');
      });

      await expect(taskService.getTasks()).rejects.toThrow('Failed to fetch tasks');
    });
  });
});