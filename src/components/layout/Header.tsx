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
    <header className="bg-white/80 backdrop-blur-lg border-b border-secondary-200 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple-500 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow-blue transition-all duration-300 group-hover:scale-105">
              <span className="text-xl">📅</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-purple-600 bg-clip-text text-transparent">
              Family Task Scheduler
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-2">
              <Link
                href="/planner"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/planner')
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                Planner
              </Link>
              <Link
                href="/tasks"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/tasks')
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/members"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/members')
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                Members
              </Link>
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                Profile
              </Link>
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                Admin
              </Link>
            </nav>

            {status === 'loading' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-secondary-500 font-medium">Loading...</span>
              </div>
            )}
            {status === 'unauthenticated' && (
              <Link href={'/auth/signin' as any}>
                <Button size="sm" variant="gradient">Sign In</Button>
              </Link>
            )}
            {status === 'authenticated' && (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-secondary-100 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {session.user?.name?.[0] ?? session.user?.email?.[0] ?? 'U'}
                  </div>
                  <span className="text-sm font-semibold text-secondary-900">
                    {session.user?.name ?? session.user?.email}
                  </span>
                </div>
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
