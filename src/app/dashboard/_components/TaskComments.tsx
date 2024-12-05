import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Comment } from '@/lib/types';

interface TaskCommentsProps {
  taskId: string;
  onCommentAdded?: (comment: Comment) => void;
}

export function TaskComments({ taskId, onCommentAdded }: TaskCommentsProps) {
  // State management
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const { data: session } = useSession();
  const { toast } = useToast();

  // Fetch comments when component mounts or comments are toggled
  useEffect(() => {
    async function fetchComments() {
      if (!showComments) return;

      setIsLoadingComments(true);
      try {
        const response = await fetch(`/api/task/${taskId}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments');

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los comentarios',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingComments(false);
      }
    }

    fetchComments();
  }, [taskId, showComments, toast]);

  // Utility function to get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date for display
  const formatCommentDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
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
      const response = await fetch(`/api/task/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Error al crear el comentario');

      const newCommentData = await response.json();
      setComments(prevComments => [newCommentData, ...prevComments]);
      setNewComment('');
      
      if (onCommentAdded) {
        onCommentAdded(newCommentData);
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

  return (
    <div className="space-y-4">
      {/* Comments toggle button */}
      <Button
        variant="ghost"
        onClick={() => setShowComments(!showComments)}
        className="flex items-center"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {comments.length} Comentarios
      </Button>

      {showComments && (
        <div className="space-y-6">
          {/* Loading state */}
          {isLoadingComments ? (
            <div className="text-center py-4 text-gray-500">
              Cargando comentarios...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay comentarios aún
            </div>
          ) : (
            // Comments list
            <div className="space-y-4">
              {comments.map((comment) => (
                <article key={comment.id} className="bg-gray-50 rounded-lg p-4">
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

          {/* Comment form */}
          {session?.user && (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
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
  );
}