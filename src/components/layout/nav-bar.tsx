'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/planner', label: 'Planner' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/members', label: 'Members' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Family Tasks
              </Link>
            </div>
            {status === 'authenticated' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {status === 'loading' && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
            {status === 'unauthenticated' && (
              <Link href={'/auth/signin' as any}>
                <Button>Sign In</Button>
              </Link>
            )}
            {status === 'authenticated' && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {session.user?.name ?? session.user?.email}
                </span>
                <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline">
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
