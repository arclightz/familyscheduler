import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <main className="text-center">
          <h1 className="text-6xl font-bold mb-6 text-blue-600">
            Family Task Scheduler
          </h1>
          <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
            Fairly distribute household tasks across your family with intelligent
            scheduling, calendar integration, and gamification
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link href={"/planner" as any} className="inline-block">
              <Button size="lg" variant="primary">
                View Planner
              </Button>
            </Link>
            <Link href={"/tasks" as any} className="inline-block">
              <Button size="lg" variant="outline">
                Manage Tasks
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📅 Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Automatically create weekly plans that respect everyone&apos;s calendar
                  and constraints. Avoid conflicts with calendar integration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚖️ Fair Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Balance workload across family members based on availability,
                  capabilities, and past contributions. View fairness metrics
                  in real-time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎮 Gamification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Earn XP, unlock badges, and maintain streaks for completing
                  tasks. Level up and redeem rewards to keep everyone motivated.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 p-8 bg-blue-100 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">✅ What&apos;s Working</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Backend</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✓ Scheduling engine with fairness balancing</li>
                  <li>✓ Plan generation (draft → publish)</li>
                  <li>✓ Gamification (XP, levels, streaks)</li>
                  <li>✓ REST API with Zod validation</li>
                  <li>✓ 15 unit tests passing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Frontend</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✓ Weekly calendar view</li>
                  <li>✓ Assignment cards with status updates</li>
                  <li>✓ Fairness meter visualization</li>
                  <li>✓ Real-time plan management</li>
                  <li>⏳ Calendar integration (coming soon)</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
