// app/login/_components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  // Hooks for navigation and URL parameters
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Initialize error state from URL parameters if present
  const [error, setError] = useState(searchParams.get('error'));

  // Handle form submission with authentication
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Attempt to sign in using NextAuth credentials provider
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        console.error('Login error:', result.error);
      } else {
        // On successful login, redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ocurrió un error al intentar iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-6 space-y-8">
      {/* Header section */}
      <div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Sirius Tasks
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Login form */}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {/* Error message display */}
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="ejemplo@sirius.com"
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>
    </Card>
  );
}