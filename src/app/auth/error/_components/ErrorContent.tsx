// app/auth/error/_components/ErrorContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function ErrorContent() {
  // Get error information from URL parameters
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Map error codes to user-friendly messages
  const getErrorMessage = (error: string) => {
    const errorMessages: Record<string, string> = {
      Configuration: 'Hay un problema con la configuración del servidor.',
      AccessDenied: 'No tienes permiso para acceder a esta página.',
      Verification: 'El link de verificación puede haber expirado.',
      Default: 'Ocurrió un error durante la autenticación.',
    };

    return errorMessages[error] || errorMessages.Default;
  };

  return (
    <Card className="max-w-md w-full p-6 space-y-4">
      {/* Error title */}
      <h1 className="text-2xl font-bold text-red-600">
        Error de Autenticación
      </h1>
      
      {/* Error message */}
      <p className="text-gray-600">
        {getErrorMessage(error || 'Default')}
      </p>

      {/* Back to login button */}
      <div className="pt-4">
        <Link href="/login">
          <Button className="w-full">
            Volver al inicio de sesión
          </Button>
        </Link>
      </div>
    </Card>
  );
}