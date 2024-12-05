import Airtable from 'airtable';
import type { Task, Comment } from './types';

// Initialize Airtable with environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

// Private helper function for internal use
async function getCommentsByIds(commentIds: string[]): Promise<Comment[]> {
  if (commentIds.length === 0) return [];

  const records = await base('Comments').select({
    filterByFormula: `OR(${commentIds.map((id) => `RECORD_ID() = '${id}'`).join(',')})`,
  }).all();

  return records.map((record) => ({
    id: record.id,
    content: record.fields['content'],
    authorId: record.fields['authorId'],
    authorName: record.fields['authorName'],
    createdAt: record.fields['createdAt'],
    taskId: record.fields['taskId'],
    edited: record.fields['edited'] || false,
    editedAt: record.fields['editedAt'] || null,
  }));
}

// Private helper function for internal use
async function formatAirtableRecord(record: any): Promise<Task> {
  const commentIds = record.fields['Comentarios'] || [];
  const comments = await getCommentsByIds(commentIds);

  return {
    id: record.id,
    title: record.fields['Titulo'] || '',
    status: record.fields['Estado']?.toLowerCase() as Task['status'],
    priority: record.fields['Prioridad']?.toLowerCase() as Task['priority'],
    deadline: record.fields['Fecha limite'] || null,
    assignedTo: record.fields['Asignado A'] || [],
    createdBy: record.fields['Creado por'] || '',
    comments,
    createdAt: record.fields['Fecha de creación'] || new Date().toISOString(),
    updatedAt: record.fields['Ultima Actualizacion'] || new Date().toISOString(),
  };
}

// Export the getTask function that's being imported in updates/route.ts
export async function getTask(taskId: string): Promise<Task> {
  try {
    const record = await base('Tareas').find(taskId);
    return formatAirtableRecord(record);
  } catch (error) {
    console.error('Error fetching task:', error);
    throw new Error('Failed to fetch task');
  }
}

// Export the taskService object that's being imported in [taskId]/route.ts
export const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      const records = await base('Tareas').select({
        view: 'Grid view',
        sort: [{ field: 'Fecha de creación', direction: 'desc' }],
      }).all();
  
      return Promise.all(records.map(formatAirtableRecord));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      const record = await base('Tareas').create({
        'Titulo': taskData.title,
        'Estado': taskData.status,
        'Prioridad': taskData.priority,
        'Fecha limite': taskData.deadline,
        'Asignado A': taskData.assignedTo,
        'Creado por': taskData.createdBy,
      });
  
      return formatAirtableRecord(record);
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const record = await base('Tareas').update(taskId, {
        ...taskData,
      });
  
      return formatAirtableRecord(record);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  },

  // Add the addComment method that's being used in [taskId]/route.ts
  async addComment(taskId: string, comment: Comment): Promise<Task> {
    try {
      // First, create the comment in the Comments table
      const commentRecord = await base('Comments').create({
        'content': comment.content,
        'authorId': comment.authorId,
        'authorName': comment.authorName,
        'createdAt': comment.createdAt,
        'taskId': taskId,
      });

      // Then, get the current task
      const taskRecord = await base('Tareas').find(taskId);
      const currentComments = taskRecord.fields['Comentarios'] || [];

      // Update the task with the new comment ID
      const updatedTask = await base('Tareas').update(taskId, {
        'Comentarios': [...currentComments, commentRecord.id],
      });

      return formatAirtableRecord(updatedTask);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  },
};