# Prompt for Claude Code

You are Claude Code, my expert pair‑programmer. Build a **Family Task Scheduler** web app that assigns routine household tasks fairly across family members week‑by‑week. It must account for absences (e.g., business trips) by reading calendar events and must be great on **desktop and mobile**. Use **Node.js + TypeScript** throughout.

---

## Product Goals
- Create and manage recurring household tasks (e.g., *walk the dog*, *empty dishwasher*, *clean hallway*).
- Auto‑plan a weekly schedule that distributes tasks fairly and respects constraints.
- Integrate with users’ calendars to detect absences and skip/adjust assignments.
- Simple, fast UI with offline‑friendly behavior and installable PWA.
- Support 2–8 family members.

## Non‑Goals (for v1)
- No monetary payments, no notifications outside web push/email.
- No complex ML; use deterministic heuristics for fairness.

---

## Tech Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, shadcn/ui, React Query (TanStack Query) for data fetching, Next PWA.
- **Backend:** Next.js API routes or a separate Fastify service (choose one and keep it in the same repo). Type‑safe endpoints with tRPC **or** Zod‑validated REST.
- **DB:** PostgreSQL + Prisma. Use drizzle‑kit or Prisma migrations.
- **Auth:** NextAuth (email + OAuth providers optional). Users belong to one or more **Households**.
- **Calendar Integrations:** Google Calendar and Microsoft Outlook via OAuth. Minimum scope: read events within a date range for each member.
- **Background jobs:** node‑cron or BullMQ (Redis) for weekly planning and reminder delivery.
- **Observability:** Pino logging, basic metrics (Prom‑client), Sentry (optional).

> If a simpler stack is desired, use **Remix + Express** instead of Next.js; keep all other choices the same.

---

## Core Features & Requirements
1. **Households & Members**
   - Create a household; invite members via email link.
   - Each member can connect one or more calendars.

2. **Tasks**
   - Define tasks with: name, description, category, duration (minutes), frequency (daily/weekly/weekday mask/cron‑like), preferred time window(s), location/room, constraints (e.g., *only adults*, *not for allergies*, *requires height*), and **fairness weight** (how much this task should count toward balance).
   - Supports **rotations** (e.g., *bathroom cleaning rotates weekly* among members).

3. **Planner**
   - Generate a **Weekly Plan** (Mon–Sun) per household.
   - Inputs: members’ availability from calendars, task frequencies, fairness history (who did what recently), preferences/exclusions, max daily load per member.
   - Output: assignment matrix [member x timeslot] with conflict‑free tasks.
   - Allow manual drag‑and‑drop edits; edits persist and affect fairness history.

4. **Calendars**
   - Pull events for each connected calendar within the planning window.
   - Detect **away** periods: events tagged with keywords (e.g., *Business Trip*, *Travel*), events marked *Out of office*, or events that span multiple hours/days.
   - Treat away periods as **unavailable** for assignments.

5. **Reminders & Check‑off**
   - Optional reminders via email and/or push notifications at task start.
   - Members “complete” tasks in the UI; completion updates fairness totals.

6. **Mobile/PWA**
   - Installable PWA; offline read of the current week’s plan and queued updates.

---

## Scheduling Algorithm (Deterministic Heuristic)
Goal: **balanced** workload, **respect constraints**, **avoid conflicts**, and **keep regularity** for routines like dog walking.

Algorithm outline:
1. **Expand tasks** into concrete **task instances** within the week (apply frequency and preferred windows).
2. For each member, build an **availability grid** by subtracting calendar busy/OOO events from household waking hours (configurable). Consider buffer time between events (e.g., 15 min).
3. Sort task instances by priority:
   - Hard‑time tasks (fixed windows) first
   - High fairness weight
   - Longer duration
4. For each instance, choose the **lowest‑cost assignment**:
   - Cost = (fairness_score_weight * member_current_load) + (preference_penalty) + (time_distance_penalty) + (constraint_penalty∞ if violated)
   - Skip members marked *away* or failing constraints.
5. Ensure **rotation rules**: if a task has a rotation roster, pick the next eligible member unless they are away; then pick the next.
6. If no feasible slot exists, flag for manual review.
7. After finalization, **persist** plan and **update fairness scores**.

Fairness score: rolling sum of (task_duration_minutes * fairness_weight) over the last N weeks (default 4). Seek to minimize variance across members.

---

## Data Model (Prisma)
```prisma
model User {
  user_id      String   @id @default(cuid())
  email        String   @unique
  name         String?
  households   HouseholdMember[]
  calendars    CalendarConnection[]
  assignments  Assignment[]
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

model Household {
  household_id String   @id @default(cuid())
  name         String
  members      HouseholdMember[]
  tasks        Task[]
  plans        Plan[]
  created_at   DateTime @default(now())
}

model HouseholdMember {
  id           String   @id @default(cuid())
  household    Household @relation(fields: [household_id], references: [household_id])
  household_id String
  user         User      @relation(fields: [user_id], references: [user_id])
  user_id      String
  role         String    // parent, teen, etc.
  capabilities String[]  // e.g. ["adult_only"]
  allergies    String[]
}

model Task {
  task_id        String   @id @default(cuid())
  household      Household @relation(fields: [household_id], references: [household_id])
  household_id   String
  name           String
  description    String?
  category       String?
  duration_min   Int
  frequency      Json     // e.g. { type: 'daily' } or { type: 'weekly', byWeekday: [1,3,5] }
  time_windows   Json?    // [{ start:"07:00", end:"08:00" }]
  constraints    Json?    // { adultsOnly: true }
  fairness_weight Int      @default(1)
  rotation_roster String[] @default([])
  active         Boolean   @default(true)
}

model Plan {
  plan_id      String   @id @default(cuid())
  household    Household @relation(fields: [household_id], references: [household_id])
  household_id String
  week_start   DateTime  // Monday 00:00 local
  status       String    // draft | published
  assignments  Assignment[]
  created_at   DateTime  @default(now())
}

model Assignment {
  assignment_id String  @id @default(cuid())
  plan          Plan    @relation(fields: [plan_id], references: [plan_id])
  plan_id       String
  task          Task    @relation(fields: [task_id], references: [task_id])
  task_id       String
  member_id     String  // HouseholdMember.id
  start_at      DateTime
  end_at        DateTime
  status        String  @default("pending") // pending | done | skipped
  notes         String?
}

model CalendarConnection {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [user_id], references: [user_id])
  user_id    String
  provider   String   // google | microsoft
  account_id String
  access     Json     // tokens (encrypted at rest)
}
```

---

## API Surface (Zod‑validated REST)
**Auth**
- `POST /api/auth/signin`
- `POST /api/auth/signout`

**Households**
- `POST /api/households` create
- `POST /api/households/:id/invite` invite user
- `GET /api/households/:id`

**Tasks**
- `POST /api/households/:id/tasks` create/update
- `GET /api/households/:id/tasks`

**Plans**
- `POST /api/households/:id/plans/generate?week=YYYY-Www` → create draft
- `POST /api/plans/:plan_id/publish`
- `GET /api/plans/:plan_id`
- `PATCH /api/assignments/:assignment_id` mark done/drag‑drop reschedule

**Calendars**
- `GET /api/calendar/providers` (auth URLs)
- `GET /api/calendar/sync?from=ISO&to=ISO` (per user)

Return typed errors `{ code, message }` and validate bodies with Zod.

---

## UI/UX Requirements
- **Views:**
  - Weekly planner (grid): columns = days, rows = time blocks; cards per task; drag‑and‑drop between members.
  - Task library with frequency/time windows and constraints editor.
  - Household members page (capabilities, allergies, connected calendars).
  - Mobile‑first: bottom tab nav → *Plan*, *Tasks*, *Members*, *Settings*.
- **Components:**
  - Availability overlays (grey out away times).
  - Fairness meter showing per‑member rolling totals.
  - Conflict banner with quick‑fix suggestions.
- **A11y & i18n:** WCAG AA, keyboard drag alternatives, i18n scaffold (English + Finnish ready).

---

## Seed Data (for local dev)
- Household: “Kallio Family”
- Members: *Parent A (adult)*, *Parent B (adult)*, *Teen (13+)*
- Tasks:
  - Walk the dog — **daily**, 07:00–08:00 & 20:00–21:00, 30 min, fairness 1
  - Empty dishwasher — **daily**, 18:00–21:00, 10 min, fairness 0.5
  - Fill dishwasher — **daily**, 18:00–21:00, 10 min, fairness 0.5
  - Clean bathroom — **weekly**, Sat 10:00–12:00, 45 min, **adultsOnly**
  - Vacuum living room — **weekly**, Wed 17:00–20:00, 20 min

---

## Planning Details & Edge Cases
- Consider school hours/homework as busy if added as recurring events.
- If a member is away the whole week, re‑weight fairness so others get more tasks now but balance evens out next week.
- Avoid assigning two high‑effort tasks back‑to‑back for the same member (cooldown of N minutes).
- If a task instance can’t be placed, surface **Unassigned** list with suggested times.
- When manual edits occur after publishing, keep an **audit trail**.

---

## 🎮 Gamification System
Design a gentle, family‑friendly system that encourages participation without unhealthy competition. Points accumulate from completed tasks, streaks, and challenges; levels unlock badges and optional real‑world rewards configured by parents.

### Core Concepts
- **Points**: Awarded on task completion. Default = `duration_min * fairness_weight / 10` (rounded), with task‑specific overrides.
- **Levels**: Cumulative point thresholds (e.g., L1=100, L2=300, L3=700...). Levels unlock **badges**, **themes**, or **reward eligibility**.
- **Badges**: Milestones (e.g., *Dog Walker Bronze* for 7 walks, *Kitchen Hero* for 20 dishwasher tasks, *Early Bird* for 10 morning tasks).
- **Streaks**: Daily/weekly continuity (e.g., completing at least one assigned task per day). Grace days configurable to be inclusive for young kids.
- **Challenges**: Time‑boxed household goals (e.g., *Sparkling Saturday*: 60 minutes of cleaning across members) with shared rewards.
- **Leaderboards**: Optional, weekly reset view; can be hidden or age‑segmented.

### Anti‑Gaming & Fairness
- Points only on **published** plan assignments marked **done** within a configurable time window.
- Cap daily points and per‑task farmable counts; late completions earn reduced points.
- Respect **constraints** (e.g., adults‑only tasks don’t inflate teen scores).
- Manual admin tools to revoke/adjust points; audit trail for changes.

### UX Additions
- **Profile card**: level, XP bar, streak indicator, latest badge.
- **Badge gallery** with rarity tiers (bronze/silver/gold) and progress meters.
- **Rewards catalog** (configured by parents) with eligibility gates by level/points.
- **Celebrations**: lightweight confetti/toast on level‑up; accessible, reduced‑motion friendly.

### Milestones & Achievements Catalog
Define clear, age‑appropriate achievements with escalating tiers. Each achievement specifies a **counter rule**, **tiers** (Bronze/Silver/Gold), and optional **cooldown**.

**Examples**
- **Dog Walker** — count completed *walk the dog* assignments
  - Bronze: 7 walks • Silver: 25 • Gold: 60
- **Dish Duty Pro** — count *empty* or *fill* dishwasher
  - Bronze: 10 • Silver: 40 • Gold: 100
- **Bathroom Boss** *(adults only)* — completed *Clean bathroom*
  - Bronze: 4 • Silver: 12 • Gold: 24
- **Morning Person** — tasks completed before 8:00
  - Bronze: 5 • Silver: 20 • Gold: 50
- **Consistency** — consecutive days with ≥1 task done
  - Bronze: 3‑day streak • Silver: 7 • Gold: 14 (grace day optional)
- **Team Player** — participate in a **household challenge** and reach contribution threshold
  - Single‑tier
- **Heavy Lifter** — total minutes on tasks with `fairness_weight >= 2`
  - Bronze: 120 min • Silver: 400 • Gold: 1000

> Achievements should prefer *progress over perfection* and celebrate effort. Tune numbers in admin.

### Award Eligibility & Redemption Rules
- Each **Reward** can specify:
  - `min_level` (e.g., Level ≥ 3)
  - `required_badges` (array of badge keys or tier minimums)
  - `cost_points` (deducted on redeem)
  - `cooldown_days` (e.g., physical rewards 30 days)
- **Guardian approval** required for redemptions above a configurable threshold.
- **Auto‑eligibility** banner appears in profile when all requirements are met.
- Anti‑abuse: tasks marked *skipped* or outside allowed windows do **not** count toward achievements.

### API Surface Additions
- `GET /api/gamification/profile` → XP, level, streaks, badges
- `POST /api/gamification/redeem` → redeem reward (guardian‑approved)
- `GET /api/gamification/leaderboard?range=week|month`
- `POST /api/gamification/award` (admin) → manual grant/adjust points

### Points Mapping (defaults)
- Walk the dog (30m): **3 pts**
- Empty/Fill dishwasher (10m each): **1 pt**
- Clean bathroom (45m, adultsOnly): **6 pts**
- Vacuum living room (20m): **2 pts**

> These are derived from `duration_min * fairness_weight / 10`. Tunable per household.

### Data Model Additions (Prisma)
```prisma
model GamificationProfile {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [user_id], references: [user_id])
  user_id     String   @unique
  xp          Int      @default(0)
  level       Int      @default(1)
  streak_days Int      @default(0)
  last_action DateTime?
  badges      EarnedBadge[]
  progress    AchievementProgress[]
}

model Badge {
  badge_id    String   @id @default(cuid())
  key         String   @unique
  name        String
  description String
  tier        String   // bronze | silver | gold | special
  icon        String?
  rules       Json     // e.g., { type: "count", taskKey: "dog_walk", count: 7 }
}

model EarnedBadge {
  id         String @id @default(cuid())
  profile    GamificationProfile @relation(fields: [profile_id], references: [id])
  profile_id String
  badge      Badge   @relation(fields: [badge_id], references: [badge_id])
  badge_id   String
  tier       String  // bronze | silver | gold | special
  earned_at  DateTime @default(now())
}

model AchievementProgress {
  id          String  @id @default(cuid())
  profile     GamificationProfile @relation(fields: [profile_id], references: [id])
  profile_id  String
  key         String  // matches Badge.key
  counter     Int     @default(0)
  last_update DateTime @default(now())
}

model LevelThreshold {
  level       Int    @id
  xp_required Int
  perks       Json?
}

model Reward {
  reward_id    String  @id @default(cuid())
  household    Household @relation(fields: [household_id], references: [household_id])
  household_id String
  name         String
  description  String?
  min_level    Int      @default(1)
  cost_points  Int      @default(0)
  required_badges String[] @default([])
  cooldown_days  Int?    // optional redemption cooldown
  active       Boolean  @default(true)
}

model Redemption {
  redemption_id String @id @default(cuid())
  reward        Reward  @relation(fields: [reward_id], references: [reward_id])
  reward_id     String
  user          User    @relation(fields: [user_id], references: [user_id])
  user_id       String
  approved_by   String? // guardian user_id
  status        String  @default("pending") // pending | approved | rejected
  created_at    DateTime @default(now())
}
```prisma
model GamificationProfile {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [user_id], references: [user_id])
  user_id     String   @unique
  xp          Int      @default(0)
  level       Int      @default(1)
  streak_days Int      @default(0)
  last_action DateTime?
  badges      EarnedBadge[]
}

model Badge {
  badge_id   String   @id @default(cuid())
  key        String   @unique
  name       String
  description String
  tier       String   // bronze | silver | gold | special
  icon       String?
  rules      Json     // e.g., { type: "count", taskKey: "dog_walk", count: 7 }
}

model EarnedBadge {
  id         String @id @default(cuid())
  profile    GamificationProfile @relation(fields: [profile_id], references: [id])
  profile_id String
  badge      Badge   @relation(fields: [badge_id], references: [badge_id])
  badge_id   String
  earned_at  DateTime @default(now())
}

model LevelThreshold {
  level       Int    @id
  xp_required Int
  perks       Json?
}

model Reward {
  reward_id   String  @id @default(cuid())
  household   Household @relation(fields: [household_id], references: [household_id])
  household_id String
  name        String
  description String?
  min_level   Int      @default(1)
  cost_points Int      @default(0)
  active      Boolean  @default(true)
}

model Redemption {
  redemption_id String @id @default(cuid())
  reward        Reward  @relation(fields: [reward_id], references: [reward_id])
  reward_id     String
  user          User    @relation(fields: [user_id], references: [user_id])
  user_id       String
  approved_by   String? // guardian user_id
  status        String  @default("pending") // pending | approved | rejected
  created_at    DateTime @default(now())
}
```

### Planner Hook‑ins
- On `Assignment` status change → compute points, update XP/level, evaluate badge rules, update streaks.
- Weekly rollover → optional **household challenge** and **leaderboard** snapshot.

---

## Implementation Steps (Command Plan)
1. **Bootstrap** Next.js + TS + Tailwind + Prisma + NextAuth.
2. Create Prisma schema & run migrations; seed with example household/tasks.
3. Build Zod schemas for API payloads; scaffold REST routes.
4. Implement calendar OAuth flows (Google/MS) and event fetchers.
5. Implement scheduling engine (module with pure functions + unit tests).
6. Build Weekly Planner UI with drag‑and‑drop and availability overlay.
7. Add plan generation flow (draft → publish) + background job weekly at Sunday 20:00 local.
8. Add reminders (email/push) and task completion toggles.
9. Add PWA and offline support for current plan.
10. Add metrics/logging and minimal admin tools.

---

## Acceptance Criteria (v1)
- Users in a household can create tasks with frequency/time windows and constraints.
- Connecting Google or Microsoft calendars marks away periods as unavailable.
- Generating a plan for a given week produces assignments with no overlaps and respects constraints.
- Manual drag‑and‑drop updates persist and reflect in fairness history.
- Fairness meter shows rolling balance over the last 4 weeks.
- Mobile layout is touch‑friendly and fully usable.

## Gamification Acceptance Criteria (v1.1)
- Completing assignments grants points per mapping; caps and late‑penalties enforced.
- XP accumulates and triggers **level‑ups** using `LevelThreshold` data.
- Badges unlock according to rules and appear in the profile and badge gallery.
- Streaks increment on eligible days and pause during calendar‑detected away trips if configured.
- Parents/guardians can configure rewards and approve redemptions.
- Optional weekly leaderboard visible and can be disabled per household.

---

## Testing Strategy
- **Unit:** scheduling cost function, rotation, fairness updates (Vitest).
- **Integration:** plan generation end‑to‑end with mocked calendars.
- **E2E:** Playwright: create household → add tasks → connect calendar (mock) → generate plan → mark done.
- **Contract:** Zod schemas reused on client and server.

---

## Developer Experience
- Scripts:
  - `dev`: next dev
  - `db:migrate`, `db:seed`
  - `plan:generate:current-week`
  - `lint`, `typecheck`, `test`, `e2e`
- Prettier + ESLint (strict), Husky pre‑commit with lint‑staged.

---

## Notes to Claude Code
- Prefer pure, testable functions in the scheduler; keep I/O separate.
- Use feature‑folder organization: `features/tasks`, `features/plans`, `features/calendars`, `features/households`.
- Implement Zod schemas first, then derive types with `z.infer`.
- Add a thin abstraction for calendar providers so Google/MS share an interface.
- Provide clear TODOs where trade‑offs are made; keep config in `.env` and `config.ts` validated by Zod.

