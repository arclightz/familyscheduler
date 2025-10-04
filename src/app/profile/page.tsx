'use client';

import React, { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/Card';
import { ProfileContent } from './ProfileContent';

export default function ProfilePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Loading...</p>
                </CardContent>
              </Card>
            </div>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>
    </>
  );
}
