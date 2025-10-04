export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/planner/:path*',
    '/tasks/:path*',
    '/members/:path*',
    '/profile/:path*',
    '/api/households/:path*',
    '/api/tasks/:path*',
    '/api/plans/:path*',
    '/api/assignments/:path*',
    '/api/gamification/:path*',
  ],
};
