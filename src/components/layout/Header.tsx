'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📅</span>
            <span className="text-xl font-bold text-blue-600">
              Family Task Scheduler
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-1">
              <Link
                href="/planner"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/planner')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Planner
              </Link>
              <Link
                href="/tasks"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/members"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/members')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Members
              </Link>
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>
            </nav>

            {status === 'loading' && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
            {status === 'unauthenticated' && (
              <Link href={'/auth/signin' as any}>
                <Button size="sm">Sign In</Button>
              </Link>
            )}
            {status === 'authenticated' && (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <span className="text-sm text-gray-700">
                  {session.user?.name ?? session.user?.email}
                </span>
                <Button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
