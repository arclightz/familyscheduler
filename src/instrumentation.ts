/**
 * Server instrumentation for Next.js
 * Runs once when the server starts
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeServer } = await import('./lib/startup');
    initializeServer();
  }
}
