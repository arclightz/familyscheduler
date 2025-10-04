import Link from 'next/link';
import { NavBar } from '@/components/layout/nav-bar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-purple-50">
      <NavBar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 max-w-7xl">
        <main>
          {/* Hero Content */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-4">
              <span className="text-6xl">📅</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-primary-600 via-accent-purple-600 to-primary-600 bg-clip-text text-transparent leading-tight">
              Family Task Scheduler
            </h1>
            <p className="text-xl md:text-2xl text-secondary-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Transform household chores into a fun, fair experience with intelligent
              scheduling, calendar sync, and gamification that keeps everyone motivated
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href={"/planner" as any} className="inline-block">
                <Button size="xl" variant="gradient" className="min-w-[200px]">
                  Launch Planner
                </Button>
              </Link>
              <Link href={"/tasks" as any} className="inline-block">
                <Button size="xl" variant="outline" className="min-w-[200px]">
                  Manage Tasks
                </Button>
              </Link>
            </div>

            <p className="text-sm text-secondary-500">
              Join thousands of families organizing better together
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card hover gradient className="animate-slide-up">
              <CardHeader>
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-3xl">📅</span>
                </div>
                <CardTitle className="text-xl mb-2">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 text-base leading-relaxed">
                  AI-powered weekly plans that respect everyone&apos;s calendar and
                  constraints. Seamlessly integrates with Google and Microsoft calendars
                  to avoid conflicts.
                </p>
              </CardContent>
            </Card>

            <Card hover gradient className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-14 h-14 bg-accent-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <CardTitle className="text-xl mb-2">Fair Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 text-base leading-relaxed">
                  Advanced algorithms balance workload across all family members based on
                  availability, skills, and contributions. Track fairness in real-time.
                </p>
              </CardContent>
            </Card>

            <Card hover gradient className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-14 h-14 bg-accent-purple-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-3xl">🎮</span>
                </div>
                <CardTitle className="text-xl mb-2">Gamification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 text-base leading-relaxed">
                  Earn XP, unlock achievement badges, and build streaks. Level up your
                  family members and redeem rewards to maintain motivation.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Section */}
          <Card className="overflow-hidden border-2 border-primary-200">
            <div className="bg-gradient-to-r from-primary-600 to-accent-purple-600 p-6">
              <h2 className="text-3xl font-bold text-white text-center">
                Powered by Modern Technology
              </h2>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent-green-500 rounded-full"></span>
                    Backend Infrastructure
                  </h3>
                  <ul className="space-y-3 text-secondary-700">
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Advanced scheduling engine with fairness algorithms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Flexible plan generation (draft to publish workflow)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Complete gamification system (XP, levels, streaks)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Type-safe REST API with Zod validation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Comprehensive test coverage (15+ unit tests)</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    User Experience
                  </h3>
                  <ul className="space-y-3 text-secondary-700">
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Interactive weekly calendar grid view</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Drag-and-drop assignment cards with status tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Visual fairness meter with workload distribution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-green-600 font-bold mt-0.5">✓</span>
                      <span>Real-time plan updates and notifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-600 font-bold mt-0.5">✓</span>
                      <span>Google & Microsoft Calendar integration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
