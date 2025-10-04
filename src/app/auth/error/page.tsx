'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              {error === 'Configuration' && 'Server configuration error'}
              {error === 'AccessDenied' && 'Access denied'}
              {error === 'Verification' && 'Verification token expired'}
              {!['Configuration', 'AccessDenied', 'Verification'].includes(error ?? '') &&
                'An unexpected error occurred'}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={'/' as any} className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
            <Link href={'/auth/signin' as any} className="flex-1">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
