# Family Task Scheduler - API Documentation

Base URL: `http://localhost:3000/api`

---

## Authentication

🚧 **Coming Soon**: NextAuth integration with email + OAuth providers

---

## Households

### List Households
```http
GET /api/households
```

**Response:**
```json
{
  "data": [
    {
      "household_id": "clxxx",
      "name": "Kallio Family",
      "created_at": "2025-10-02T00:00:00.000Z"
    }
  ],
  "success": true
}
```

### Create Household
```http
POST /api/households
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Smith Family"
}
```

### Get Household
```http
GET /api/households/:id
```

---

## Tasks

### List Tasks
```http
GET /api/households/:id/tasks
```

**Response:**
```json
{
  "data": [
    {
      "task_id": "task-1",
      "household_id": "hh-1",
      "name": "Walk the dog",
      "description": "Take the dog around the neighborhood",
      "category": "Pet Care",
      "duration_min": 30,
      "frequency": { "type": "daily" },
      "time_windows": [
        { "start": "07:00", "end": "08:00" },
        { "start": "20:00", "end": "21:00" }
      ],
      "constraints": null,
      "fairness_weight": 1,
      "rotation_roster": [],
      "active": true
    }
  ],
  "success": true
}
```

### Create Task
```http
POST /api/households/:id/tasks
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Vacuum living room",
  "description": "Vacuum carpets and rugs",
  "category": "Cleaning",
  "duration_min": 20,
  "frequency": {
    "type": "weekly",
    "byWeekday": [3]
  },
  "time_windows": [
    { "start": "17:00", "end": "20:00" }
  ],
  "constraints": {
    "adultsOnly": false
  },
  "fairness_weight": 1
}
```

**Frequency Types:**
- `{ "type": "daily" }` - Every day
- `{ "type": "weekly", "byWeekday": [0,1,2,3,4,5,6] }` - 0=Sunday, 6=Saturday
- `{ "type": "monthly", "byMonthDay": 15 }` - Specific day of month
- `{ "type": "custom", "cron": "0 9 * * 1" }` - Cron expression

**Constraints:**
```json
{
  "adultsOnly": true,
  "minimumAge": 16,
  "excludeAllergies": ["dust", "pets"],
  "requiredCapabilities": ["can_drive", "has_license"]
}
```

---

## Plans

### List Plans
```http
GET /api/households/:id/plans
```

**Response includes:**
- Last 10 plans for the household
- All assignments with task and user details

### Generate Weekly Plan
```http
POST /api/households/:id/plans
Content-Type: application/json
```

**Request Body:**
```json
{
  "week_start": "2025-10-06T00:00:00.000Z"
}
```

**Response:**
```json
{
  "data": {
    "plan_id": "plan-123",
    "status": "draft",
    "assignments_count": 23,
    "unassigned_count": 0,
    "conflicts": []
  },
  "success": true
}
```

**Scheduling Algorithm:**
The plan generation uses a cost-based algorithm that:
1. Expands tasks into concrete instances for the week
2. Builds member availability from calendar events
3. Sorts tasks by priority (narrow time windows, high fairness weight, long duration)
4. Assigns each task to the lowest-cost member:
   - Cost includes fairness score, constraint penalties, time preferences
   - Respects `adultsOnly`, allergies, required capabilities
   - Avoids calendar conflicts with 15-min buffer
5. Updates fairness history after assignment

### Get Plan
```http
GET /api/plans/:id
```

**Response includes:**
- Plan metadata
- All assignments with task and user details
- Ordered by start time

### Publish Plan
```http
POST /api/plans/:id/publish
```

**Effect:**
- Changes status from `draft` to `published`
- Published plans count toward fairness history
- Only published plan tasks award XP/badges

---

## Assignments

### Get Assignment
```http
GET /api/assignments/:id
```

### Update Assignment
```http
PATCH /api/assignments/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "done",
  "notes": "Completed early"
}
```

**Status Values:**
- `pending` - Not yet completed
- `done` - Completed (awards XP, updates streak)
- `skipped` - Skipped (no XP)

**Gamification on Completion:**
When status is set to `done`:
1. XP awarded: `(duration_min * fairness_weight) / 10`
2. Level updated based on XP thresholds
3. Streak incremented if last action was yesterday
4. Achievement progress tracked (badges)

**Time Adjustments:**
```json
{
  "start_at": "2025-10-06T07:15:00.000Z",
  "end_at": "2025-10-06T07:45:00.000Z"
}
```

---

## Gamification

### Get Profile
```http
GET /api/gamification/profile?user_id=xxx
```

**Response:**
```json
{
  "data": {
    "id": "profile-1",
    "user_id": "user-1",
    "xp": 150,
    "level": 2,
    "streak_days": 5,
    "last_action": "2025-10-05T08:00:00.000Z",
    "badges": [
      {
        "id": "earned-1",
        "badge": {
          "key": "dog_walker_bronze",
          "name": "Dog Walker Bronze",
          "tier": "bronze"
        },
        "earned_at": "2025-10-01T00:00:00.000Z"
      }
    ]
  },
  "success": true
}
```

**Level Thresholds:**
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 300 XP
- Level 4: 700 XP
- Level 5: 1500 XP

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Household not found"
  },
  "success": false
}
```

**Common Error Codes:**
- `INVALID_ID` - Malformed ID parameter
- `NOT_FOUND` - Resource doesn't exist
- `PLAN_EXISTS` - Plan already exists for this week
- `VALIDATION_ERROR` - Request body validation failed

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (e.g., plan already exists)
- `500` - Internal Server Error

---

## Development

### Test Plan Generation

Run the test script:
```bash
npx tsx scripts/test-plan-generation.ts
```

This will:
1. Find the Kallio Family household
2. Generate a plan for next Monday
3. Display all assignments

### Run Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run typecheck     # Type checking
```

### Seed Data

The database is seeded with:
- Kallio Family household
- 3 users (Parent A, Parent B, Teen)
- 5 tasks (Walk dog, Empty/Fill dishwasher, Clean bathroom, Vacuum)
- Gamification profiles with initial XP
- 4 badges
- 5 level thresholds

---

## Next Steps

See [NEXT_STEPS.md](./NEXT_STEPS.md) for the development roadmap.

Priority items:
1. ✅ **Scheduling Engine** - Complete with tests
2. ✅ **Plan Generation** - Draft/publish workflow working
3. 🚧 **Weekly Planner UI** - In progress
4. ⏳ **Calendar Integration** - OAuth flows needed
5. ⏳ **NextAuth Setup** - Authentication
6. ⏳ **Reminders** - Email/push notifications
