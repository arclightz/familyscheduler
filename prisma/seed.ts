import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users with verified emails for development authentication
  const parentA = await prisma.user.create({
    data: {
      email: 'parent.a@example.com',
      name: 'Parent A',
      emailVerified: new Date(),
    },
  });

  const parentB = await prisma.user.create({
    data: {
      email: 'parent.b@example.com',
      name: 'Parent B',
      emailVerified: new Date(),
    },
  });

  const teen = await prisma.user.create({
    data: {
      email: 'teen@example.com',
      name: 'Teen',
      emailVerified: new Date(),
    },
  });

  // Create household
  const household = await prisma.household.create({
    data: {
      name: 'Kallio Family',
    },
  });

  // Create household members
  const memberA = await prisma.householdMember.create({
    data: {
      household_id: household.household_id,
      user_id: parentA.user_id,
      role: 'parent',
      capabilities: ['adult_only'],
      allergies: [],
    },
  });

  const memberB = await prisma.householdMember.create({
    data: {
      household_id: household.household_id,
      user_id: parentB.user_id,
      role: 'parent',
      capabilities: ['adult_only'],
      allergies: [],
    },
  });

  const memberTeen = await prisma.householdMember.create({
    data: {
      household_id: household.household_id,
      user_id: teen.user_id,
      role: 'teen',
      capabilities: [],
      allergies: [],
    },
  });

  // Create tasks as specified in the plan
  await prisma.task.create({
    data: {
      household_id: household.household_id,
      name: 'Walk the dog',
      description: 'Take the dog for a walk around the neighborhood',
      category: 'Pet Care',
      duration_min: 30,
      frequency: { type: 'daily' },
      time_windows: [
        { start: '07:00', end: '08:00' },
        { start: '20:00', end: '21:00' },
      ],
      fairness_weight: 1,
      rotation_roster: [],
    },
  });

  await prisma.task.create({
    data: {
      household_id: household.household_id,
      name: 'Empty dishwasher',
      description: 'Remove clean dishes from the dishwasher and put them away',
      category: 'Kitchen',
      duration_min: 10,
      frequency: { type: 'daily' },
      time_windows: [{ start: '18:00', end: '21:00' }],
      fairness_weight: 0.5,
      rotation_roster: [],
    },
  });

  await prisma.task.create({
    data: {
      household_id: household.household_id,
      name: 'Fill dishwasher',
      description: 'Load dirty dishes into the dishwasher and start the cycle',
      category: 'Kitchen',
      duration_min: 10,
      frequency: { type: 'daily' },
      time_windows: [{ start: '18:00', end: '21:00' }],
      fairness_weight: 0.5,
      rotation_roster: [],
    },
  });

  await prisma.task.create({
    data: {
      household_id: household.household_id,
      name: 'Clean bathroom',
      description: 'Deep clean the bathroom including toilet, shower, and sink',
      category: 'Cleaning',
      duration_min: 45,
      frequency: { type: 'weekly', byWeekday: [6] }, // Saturday
      time_windows: [{ start: '10:00', end: '12:00' }],
      constraints: { adultsOnly: true },
      fairness_weight: 2,
      rotation_roster: [],
    },
  });

  await prisma.task.create({
    data: {
      household_id: household.household_id,
      name: 'Vacuum living room',
      description: 'Vacuum the carpet and rugs in the living room',
      category: 'Cleaning',
      duration_min: 20,
      frequency: { type: 'weekly', byWeekday: [3] }, // Wednesday
      time_windows: [{ start: '17:00', end: '20:00' }],
      fairness_weight: 1,
      rotation_roster: [],
    },
  });

  // Create gamification profiles
  await prisma.gamificationProfile.create({
    data: {
      user_id: parentA.user_id,
      xp: 150,
      level: 2,
      streak_days: 3,
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      user_id: parentB.user_id,
      xp: 120,
      level: 2,
      streak_days: 5,
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      user_id: teen.user_id,
      xp: 80,
      level: 1,
      streak_days: 2,
    },
  });

  // Create level thresholds
  await prisma.levelThreshold.createMany({
    data: [
      { level: 1, xp_required: 0 },
      { level: 2, xp_required: 100 },
      { level: 3, xp_required: 300 },
      { level: 4, xp_required: 700 },
      { level: 5, xp_required: 1500 },
    ],
  });

  // Create some badges
  await prisma.badge.createMany({
    data: [
      {
        key: 'dog_walker_bronze',
        name: 'Dog Walker Bronze',
        description: 'Completed 7 dog walks',
        tier: 'bronze',
        rules: { type: 'count', taskName: 'Walk the dog', count: 7 },
      },
      {
        key: 'dog_walker_silver',
        name: 'Dog Walker Silver',
        description: 'Completed 25 dog walks',
        tier: 'silver',
        rules: { type: 'count', taskName: 'Walk the dog', count: 25 },
      },
      {
        key: 'kitchen_helper_bronze',
        name: 'Kitchen Helper Bronze',
        description: 'Completed 10 dishwasher tasks',
        tier: 'bronze',
        rules: { type: 'count', category: 'Kitchen', count: 10 },
      },
      {
        key: 'early_bird',
        name: 'Early Bird',
        description: 'Completed 5 tasks before 8:00 AM',
        tier: 'bronze',
        rules: { type: 'time_based', before: '08:00', count: 5 },
      },
    ],
  });

  console.log('Seed data created successfully!');
  console.log(`Created household: ${household.name}`);
  console.log(`Created ${3} users and ${3} household members`);
  console.log(`Created ${5} tasks`);
  console.log(`Created gamification data`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });