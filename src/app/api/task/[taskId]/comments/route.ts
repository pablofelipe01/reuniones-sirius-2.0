import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Airtable from 'airtable';

// Initialize Airtable with environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

// GET handler to fetch comments for a specific task
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskId = params.taskId;
    
    // Query Airtable for comments related to this task
    const records = await base('Comments')
      .select({
        filterByFormula: `SEARCH("${taskId}", ARRAYJOIN(Task, ","))`,
        sort: [{ field: 'createdAt', direction: 'desc' }]
      })
      .all();

    // Transform the records into our comment format, using only fields that exist
    const comments = records.map(record => ({
      id: record.id,
      authorName: record.get('authorName') as string,
      content: record.get('content') as string,
      createdAt: record.get('createdAt') as string,
      taskId: taskId
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST handler to create new comments
export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  let session;
  
  try {
    session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.taskId;
    const body = await request.json();

    // Get the user's full name from Airtable
    const userRecords = await base('Equipo').select({
      filterByFormula: `{email} = '${session.user.email}'`,
      maxRecords: 1
    }).firstPage();

    // Use the full name from Airtable if available, otherwise use the name from the session
    const fullName = userRecords[0]?.fields.name || session.user.name || 'Anonymous';

    // Create the comment using only the fields that exist in your Airtable
    const commentRecord = await base('Comments').create({
      authorName: fullName,
      content: body.content,
      createdAt: new Date().toISOString(),
      Task: [taskId]
    });

    // Return the comment data matching the structure used in the GET handler
    const newComment = {
      id: commentRecord.id,
      authorName: commentRecord.fields.authorName as string,
      content: commentRecord.fields.content as string,
      createdAt: commentRecord.fields.createdAt as string,
      taskId: taskId
    };

    return NextResponse.json(newComment);
    
  } catch (error) {
    console.error('Error in comment creation:', {
      error,
      sessionUser: session?.user || 'No session available',
      taskId: params.taskId
    });
    
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}