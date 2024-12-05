'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MessageSquare, 
  Clock, 
  Flag,
  MoreVertical,
  Check,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import type { Task, Comment } from '@/lib/types';

// New Import for Voice Comment Recorder
import { VoiceCommentRecorder } from '@/components/VoiceCommentRecorder';

// Define the props interface for the component
interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: string) => Promise<void>;
  onAddComment?: (taskId: string, comment: string) => Promise<void>;
}

export function TaskCard({ task, onStatusChange, onAddComment }: TaskCardProps) {
  // State management for comments and UI
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  
  // Access session and toast functionality
  const { data: session } = useSession();
  const { toast } = useToast();

  // Function to fetch comments from the API
  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/task/${task.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      const commentsArray = Array.isArray(data) ? data : [];
      setComments(commentsArray);
      setCommentCount(commentsArray.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los comentarios',
        variant: 'destructive',
      });
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Fetch comments on initial load
  useEffect(() => {
    fetchComments();
  }, [task.id]);

  // Fetch comments when comments section is expanded
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  // Helper function to get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Format the comment date for display
  const formatCommentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Hace un momento';
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: es
      });
    } catch {
      return 'Hace un momento';
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para comentar',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/task/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Error al crear el comentario');

      const newCommentData = await response.json();
      
      // Update local state with new comment
      setComments(prevComments => [newCommentData, ...prevComments]);
      setCommentCount(prev => prev + 1);
      setNewComment('');

      if (onAddComment) {
        await onAddComment(task.id, newComment.trim());
      }

      toast({
        title: 'Comentario añadido',
        description: 'Tu comentario ha sido publicado exitosamente.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo publicar el comentario',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
  // const handleVoiceComment = async (audioBlob: Blob) => {
  //   setIsSubmitting(true);
  
  //   try {
  //     if (!audioBlob || audioBlob.size === 0) {
  //       throw new Error('Grabación inválida.');
  //     }
  
  //     const formData = new FormData();
  //     const timestamp = Date.now();
  //     const audioFile = new File([audioBlob], `recording-${timestamp}.webm`, {
  //       type: 'audio/webm;codecs=opus',
  //       lastModified: timestamp,
  //     });
  
  //     formData.append('audio', audioFile);
  //     formData.append(
  //       'metadata',
  //       JSON.stringify({
  //         createdBy: session?.user?.name || 'Anonymous',
  //         timestamp,
  //         filename: audioFile.name,
  //         mimeType: audioFile.type,
  //       })
  //     );
  
  //     const n8nResponse = await fetch('https://tok-n8n-sol.onrender.com/webhook/comentarios', {
  //       method: 'POST',
  //       body: formData,
  //     });
  
  //     if (!n8nResponse.ok) {
  //       throw new Error('Error al enviar el audio a n8n.');
  //     }
  
  //     const n8nData = await n8nResponse.json();
  //     const transcriptionText = n8nData.content || 'Transcripción no disponible';
  
  //     // Prepara el comentario con el `taskId` del componente
  //     const commentPayload = {
  //       content: transcriptionText,
  //       createdAt: new Date(timestamp).toISOString(),
  //       authorName: session?.user?.name || 'Anonymous',
  //       isVoiceComment: true,
  //     };
  
  //     const response = await fetch(`/api/task/${task.id}/comments`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(commentPayload),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Error al guardar el comentario de voz.');
  //     }
  
  //     const newComment = await response.json();
  
  //     setComments((prevComments) => [newComment, ...prevComments]);
  //     setCommentCount((prev) => prev + 1);
  
  //     toast({
  //       title: 'Comentario de voz añadido',
  //       description: 'El comentario de voz se guardó exitosamente.',
  //     });
  //   } catch (error) {
  //     console.error('Error procesando comentario de voz:', error);
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'No se pudo procesar el comentario de voz.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  
  

  //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

  const handleVoiceComment = async (audioBlob: Blob) => {
    setIsSubmitting(true);
  
    try {
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Grabación inválida.');
      }
  
      // Determine if we're running in Safari
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // Create the file with the appropriate format
      const formData = new FormData();
      const timestamp = Date.now();
      const fileName = `recording-${timestamp}.${isSafari ? 'mp4' : 'webm'}`;
      const mimeType = isSafari ? 'audio/mp4' : 'audio/webm;codecs=opus';
      
      const audioFile = new File([audioBlob], fileName, {
        type: mimeType,
        lastModified: timestamp,
      });
  
      // Log the file details for debugging
      console.log('Creating audio file:', {
        name: fileName,
        type: mimeType,
        size: audioFile.size,
        timestamp: timestamp
      });
  
      formData.append('audio', audioFile);
      formData.append(
        'metadata',
        JSON.stringify({
          createdBy: session?.user?.name || 'Anonymous',
          timestamp,
          filename: audioFile.name,
          mimeType: audioFile.type,
          browser: isSafari ? 'safari' : 'other', // Add browser info to help debug
        })
      );
  
      console.log('Sending request to n8n...');
      const n8nResponse = await fetch('https://tok-n8n-sol.onrender.com/webhook/comentarios', {
        method: 'POST',
        body: formData,
      });
  
      if (!n8nResponse.ok) {
        // Log more details about the error
        const errorText = await n8nResponse.text();
        console.error('n8n error details:', {
          status: n8nResponse.status,
          statusText: n8nResponse.statusText,
          response: errorText
        });
        throw new Error(`Error al enviar el audio a n8n: ${n8nResponse.status} ${n8nResponse.statusText}`);
      }
  
      const n8nData = await n8nResponse.json();
      const transcriptionText = n8nData.content || 'Transcripción no disponible';
  
      // Create the comment
      const commentPayload = {
        content: transcriptionText,
        createdAt: new Date(timestamp).toISOString(),
        authorName: session?.user?.name || 'Anonymous',
        isVoiceComment: true,
      };
  
      const response = await fetch(`/api/task/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload),
      });
  
      if (!response.ok) {
        throw new Error('Error al guardar el comentario de voz.');
      }
  
      const newComment = await response.json();
  
      setComments((prevComments) => [newComment, ...prevComments]);
      setCommentCount((prev) => prev + 1);
  
      toast({
        title: 'Comentario de voz añadido',
        description: 'El comentario de voz se guardó exitosamente.',
      });
    } catch (error) {
      console.error('Error procesando comentario de voz:', error);
      // Provide more detailed error message to the user
      toast({
        title: 'Error en el comentario de voz',
        description: error.message || 'No se pudo procesar el comentario de voz.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

//====================================================
  // Handle task status changes
  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange) return;
    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la tarea',
        variant: 'destructive',
      });
    }
  };

  // Style helper functions for status and priority badges
  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_progreso: 'bg-blue-100 text-blue-800',
      completada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      aceptada: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      {/* Task Header Section */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <div className="flex gap-2 mt-2">
            {/* Status Badge */}
            <span
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
            >
              <Clock className="inline-block w-4 h-4 mr-2" />
              {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
            </span>
            {/* Priority Badge */}
            <span
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}
            >
              <Flag className="inline-block w-4 h-4 mr-2" />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>

        {/* Task Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange('completada')}>
              <Check className="mr-2 h-4 w-4" /> Marcar como completada
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('en_progreso')}>
              <Clock className="mr-2 h-4 w-4" /> Marcar en progreso
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Task Content Section */}
      <CardContent>
        <div className="space-y-4">
          {/* Assignees Section */}
          <div>
            <p className="text-sm text-gray-600">Asignado a:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-1">
              {task.assignedTo.map((person) => (
                <div
                  key={person}
                  className="flex items-center"
                >
                  <User className="inline-block w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{person}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div>
            <p className="text-sm text-gray-600">
              Creado por: <strong>{task.createdBy}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Creado: {formatDate(task.createdAt)}
            </p>
            <p className="text-sm text-gray-600">
              Fecha límite: {formatDate(task.deadline)}
            </p>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {commentCount} Comentarios
            </Button>

            {showComments && (
              <div className="space-y-6">
                {isLoadingComments ? (
                  <div className="text-center py-4 text-gray-500">
                    Cargando comentarios...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No hay comentarios aún
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <article 
                        key={`${comment.id}-${comment.createdAt}`} 
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src="" 
                                alt={`Avatar de ${comment.authorName}`}
                              />
                              
                            </Avatar>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.authorName}
                              </span>
                              <time className="text-xs text-gray-500">
                                {formatCommentDate(comment.createdAt)}
                              </time>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* Comment Form */}
                {session?.user && (
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      {/* Voice Comment Recorder Integration */}
                      <VoiceCommentRecorder
                        onRecordingComplete={handleVoiceComment}
                        isSubmitting={isSubmitting}
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                      >
                        {isSubmitting ? 'Publicando...' : 'Publicar comentario'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
