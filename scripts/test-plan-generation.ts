/**
 * Script to test plan generation
 */

import { PrismaClient } from '@prisma/client';
import { generateWeeklyPlan } from '../src/features/plans/service';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing plan generation...\n');

  // Get the Kallio Family household
  const household = await prisma.household.findFirst({
    where: { name: 'Kallio Family' },
  });

  if (!household) {
    throw new Error('Kallio Family household not found. Run seed first.');
  }

  console.log(`Found household: ${household.name}\n`);

  // Get next Monday as week start
  const now = new Date();
  const daysUntilMonday = (1 - now.getDay() + 7) % 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  console.log(`Generating plan for week starting: ${nextMonday.toISOString()}\n`);

  try {
    const result = await generateWeeklyPlan({
      household_id: household.household_id,
      week_start: nextMonday,
      calendar_events: new Map(), // No calendar events for this test
    });

    console.log('✅ Plan generated successfully!\n');
    console.log(`Plan ID: ${result.plan_id}`);
    console.log(`Status: ${result.status}`);
    console.log(`Assignments created: ${result.assignments_count}`);
    console.log(`Unassigned tasks: ${result.unassigned_count}`);

    if (result.conflicts.length > 0) {
      console.log('\n⚠️  Conflicts:');
      result.conflicts.forEach((c) => console.log(`  - ${c}`));
    }

    // Fetch and display assignments
    console.log('\n📋 Assignments:');
    const plan = await prisma.plan.findUnique({
      where: { plan_id: result.plan_id },
      include: {
        assignments: {
          include: {
            task: true,
            user: true,
          },
          orderBy: { start_at: 'asc' },
        },
      },
    });

    if (plan) {
      for (const assignment of plan.assignments) {
        const start = new Date(assignment.start_at);
        const end = new Date(assignment.end_at);
        console.log(
          `  ${start.toLocaleString()} - ${assignment.task.name} (${assignment.task.duration_min}min) → ${assignment.user.name}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Error generating plan:');
    console.error(error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
