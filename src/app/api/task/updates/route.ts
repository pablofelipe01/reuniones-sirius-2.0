// app/api/tasks/updates/route.ts
import { headers } from 'next/headers';
import { getTask } from '@/lib/tasks';

export async function GET() {
  const headersList = headers();
  const response = new Response(
    new ReadableStream({
      async start(controller) {
        controller.enqueue('retry: 1000\n\n');  // Reconnect after 1s if connection lost

        // Function to send updates
        const sendUpdate = async (taskId: string) => {
          try {
            const task = await getTask(taskId);
            const data = `data: ${JSON.stringify({ type: 'UPDATE', task })}\n\n`;
            controller.enqueue(data);
          } catch (error) {
            console.error('Error sending update:', error);
          }
        };

        // Keep connection alive
        const interval = setInterval(() => {
          controller.enqueue(':\n\n'); // Heartbeat
        }, 30000);

        // Cleanup on close
        return () => {
          clearInterval(interval);
        };
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );

  return response;
}