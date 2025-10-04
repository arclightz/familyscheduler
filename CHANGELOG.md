# Changelog

All notable changes to the Family Task Scheduler project.

## [Unreleased] - 2025-10-04

### Added - Session 3: Calendar Integration

**OAuth Authentication**
- Google Calendar OAuth 2.0 flow with googleapis
- Microsoft Calendar OAuth 2.0 flow with Graph API
- Automatic token refresh for expired credentials
- Secure token storage (ready for encryption)

**Calendar Services**
- Google Calendar event fetching (`src/features/calendars/google-calendar.ts`)
- Microsoft Calendar event fetching (`src/features/calendars/microsoft-calendar.ts`)
- Unified calendar service for multi-provider support
- Event normalization to common format

**API Endpoints**
- `GET /api/calendar/connect/google` - Initiate Google OAuth
- `GET /api/calendar/connect/google/callback` - Google OAuth callback
- `GET /api/calendar/connect/microsoft` - Initiate Microsoft OAuth
- `GET /api/calendar/connect/microsoft/callback` - Microsoft OAuth callback
- `GET /api/calendar/connections` - List user connections
- `DELETE /api/calendar/connections` - Disconnect calendar
- `GET /api/calendar/events` - Fetch events from all connected calendars

**UI Components**
- Calendar Connections component in Profile page
- Connect/disconnect functionality with OAuth flow
- Success/error notifications for calendar operations
- Connected account display with provider badges

**Documentation**
- Comprehensive calendar integration guide (`CALENDAR_INTEGRATION.md`)
- Setup instructions for Google and Microsoft
- Security considerations and token encryption guidelines
- API endpoint documentation
- Troubleshooting guide

**Dependencies Added**
- `googleapis@^161.0.0` - Google Calendar API client
- `@microsoft/microsoft-graph-client@^3.0.7` - Microsoft Graph client
- `@azure/identity@^4.12.0` - Azure authentication

### Added - Session 2: UI Enhancement

**Navigation & Layout**
- Global Header component with active route highlighting
- Consistent page layout across all views
- Mobile-responsive navigation menu

**Task Management**
- Full-featured task creation form (`/tasks/new`)
- Frequency selection (daily/weekly/monthly)
- Time window configuration
- Constraint management (adults-only, allergies)
- Fairness weight slider
- Real-time validation with user feedback

**Gamification Display**
- Profile page (`/profile`) showing:
  - Level and XP with progress bar
  - Streak counter with visual indicator
  - Badge collection gallery
  - Quick stats summary
- XP calculation based on task completion
- Level threshold visualization

**Member Management**
- Members page (`/members`) displaying:
  - All household members with roles
  - Capabilities (adult_only, etc.)
  - Allergies and restrictions
  - Household statistics

**Updates to Existing Pages**
- Tasks page: Added "Create Task" button
- Planner page: Integrated with Header
- All pages: Consistent styling and layout

### Added - Session 1: Core Features

**Backend**
- Complete scheduling engine with fairness algorithm
- Plan generation service (draft/publish workflow)
- REST API with Zod validation (10 endpoints)
- Gamification integration (XP, levels, streaks)
- Prisma database schema with seed data
- 15 passing unit tests for scheduler

**Frontend**
- Weekly planner with calendar grid view
- Assignment cards with status updates
- Fairness meter with workload visualization
- Task library display with statistics
- React hooks for data management

**Infrastructure**
- Next.js 15 + TypeScript + Tailwind CSS
- SQLite database with Prisma ORM
- Comprehensive Zod schemas
- Type-safe API utilities
- Git repository with clean commit history

## Project Statistics

**Code Metrics**
- Total TypeScript files: 45+
- Lines of code: ~6,500+
- React components: 16
- Pages: 6 (Home, Planner, Tasks, Task Creation, Members, Profile)
- API routes: 16 (10 core + 6 calendar)
- Test files: 1 (15 tests)
- Calendar services: 3 (Google, Microsoft, Unified)

**Test Coverage**
- Core scheduler: 100%
- All tests passing ✅

**Features Completed**
- ✅ Scheduling engine with fairness balancing
- ✅ Plan generation (draft → publish)
- ✅ Task management (CRUD operations)
- ✅ Gamification (XP, levels, streaks, badges)
- ✅ Weekly calendar UI
- ✅ Assignment status tracking
- ✅ Fairness visualization
- ✅ Task creation workflow
- ✅ Member management UI
- ✅ Profile/stats display
- ✅ Calendar Integration (Google/Microsoft OAuth)
- ✅ Calendar event fetching and availability sync

**Remaining Features**
- ⏳ NextAuth authentication
- ⏳ Drag-and-drop task reassignment
- ⏳ Email/push reminders
- ⏳ PWA support with offline mode
- ⏳ E2E tests

## Development

**Latest Commits**
```
718ff19 docs: update progress report with new UI features
f5e4e2a feat(ui): add navigation, task form, profile, and members pages
cabf654 docs: add comprehensive progress report and update roadmap
b161a14 feat(ui): implement weekly planner and task management UI
c7005da docs: add API documentation and update project status
13fd2f8 feat(scheduler): implement core scheduling engine and plan generation
```

**Running the App**
```bash
npm run dev         # http://localhost:3000
npm test           # Run unit tests
npm run typecheck  # TypeScript validation
```

**Demo Flow**
1. Visit http://localhost:3000
2. Click "View Planner"
3. Click "Generate New Plan"
4. See 23 assignments across 7 days
5. Mark tasks complete to earn XP
6. Visit Profile to see level/badges
7. Visit Members to see household
8. Visit Tasks to create new tasks

---

**Next Release Targets**
- Calendar OAuth integration
- User authentication with NextAuth
- Enhanced UI polish and animations
- Mobile PWA manifest
