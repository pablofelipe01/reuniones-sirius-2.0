import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { taskService } from '@/lib/tasks';

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const updatedTask = await taskService.updateTask(params.taskId, body);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const comment = {
      content: body.content,
      authorId: session.user.id,
      authorName: session.user.name || 'Unknown User',
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID()
    };

    const updatedTask = await taskService.addComment(params.taskId, comment);
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}