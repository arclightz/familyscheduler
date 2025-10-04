'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/forms/TaskForm';
import { Header } from '@/components/layout/Header';

// TODO: Replace with actual household ID from auth context
const DEMO_HOUSEHOLD_ID = 'demo-household';

export default function NewTaskPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/households/${DEMO_HOUSEHOLD_ID}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      router.push('/tasks');
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-gray-600 mt-2">
              Define a recurring household task
            </p>
          </div>

          <TaskForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/tasks')}
            submitLabel="Create Task"
          />
        </div>
      </div>
    </>
  );
}
