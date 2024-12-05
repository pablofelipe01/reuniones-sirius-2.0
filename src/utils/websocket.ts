// utils/websocket.ts
import { useEffect, useState } from 'react';

export function useTaskUpdates(initialTasks) {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    ws.onmessage = (event) => {
      const updatedTask = JSON.parse(event.data);
      setTasks(current => 
        current.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    };

    return () => ws.close();
  }, []);

  return tasks;
}