export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Family Task Scheduler
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Assign household tasks fairly across family members with calendar integration
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <p className="text-sm text-gray-500">
            Coming soon: Complete family task management
          </p>
        </div>
      </div>
    </main>
  );
}