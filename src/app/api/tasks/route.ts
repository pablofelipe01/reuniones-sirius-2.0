import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Airtable from 'airtable';

// Initialize Airtable with environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

// Helper function to format Airtable records
function formatTask(record: any) {
  return {
    id: record.id,
    title: record.fields['Titulo'] || '',
    status: record.fields['Estado']?.toLowerCase() || 'pendiente',
    priority: record.fields['Prioridad']?.toLowerCase() || 'media',
    deadline: record.fields['Fecha limite'] || null,
    assignedTo: record.fields['Asignado A'] || [],
    createdBy: record.fields['Creado por'] || '',
    comments: record.fields['Comentarios'] || [],
    createdAt: record.fields['Fecha de creación'],
    updatedAt: record.fields['Ultima Actualizacion']
  };
}

// GET handler for fetching tasks
export async function GET() {
  try {
    // Verify authentication
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch records from Airtable
    const records = await base('Tareas').select({
      view: 'Grid view',
      sort: [{ field: 'Fecha de creación', direction: 'desc' }]
    }).all();

    // Format the records
    const tasks = records.map(formatTask);

    // Return the formatted tasks
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST handler for creating new tasks
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const record = await base('Tareas').create({
      'Titulo': body.title,
      'Estado': body.status,
      'Prioridad': body.priority,
      'Fecha de creación': body.createdAt,
      'Fecha limite': body.deadline,
      'Asignado A': body.assignedTo,
      'Creado por': body.createdBy,
    });

    return NextResponse.json(formatTask(record));
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}