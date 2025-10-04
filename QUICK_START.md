# Family Task Scheduler - Quick Start Guide

## 🚀 Get Started in 60 Seconds

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create database and run migrations
npm run db:push

# Seed with test data
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Your Browser
Visit: **http://localhost:3000**

---

## 🔑 Test Accounts

The application comes with **pre-configured test accounts**. No OAuth setup required!

### Sign In With:

**Parent Account A:**
- Email: `parent.a@example.com`
- Password: `anything` (any password works in dev mode!)

**Parent Account B:**
- Email: `parent.b@example.com`
- Password: `anything`

**Teen Account:**
- Email: `teen@example.com`
- Password: `anything`

**Or Create New:**
- Email: `your-email@example.com`
- Password: `anything`
- User will be auto-created in development mode!

---

## 📋 What's Already Set Up

### Test Household: "Example Family"

**Members:**
- Parent A (adult capabilities)
- Parent B (adult capabilities)
- Teen (age 15)

**Tasks Configured:**
- 🍳 Cook Dinner (daily, 60 min, adult-only)
- 🧹 Vacuum Living Room (weekly, 30 min)
- 🧺 Laundry (weekly, 45 min, adult-only)
- 🗑️ Take Out Trash (weekly, 10 min)
- 🚗 Drive to Sports Practice (weekly, 60 min, adult-only)
- 🐕 Walk the Dog (daily, 20 min)

### Gamification System:
- XP and levels configured
- Badges ready to earn
- Streaks tracking active
- Rewards available

---

## 🎯 Quick Tour

### 1. Landing Page (/)
- Beautiful gradient hero
- Feature overview
- Sign in button

### 2. Sign In (/auth/signin)
- Email/password form (works instantly!)
- OAuth options (optional)
- Test accounts ready

### 3. Planner (/planner)
- Weekly calendar view
- Task assignments
- Fairness meter
- Plan management

### 4. Tasks (/tasks)
- View all household tasks
- Add new tasks
- Configure schedules

### 5. Profile (/profile)
- Gamification stats (XP, level, streak)
- Badges earned
- Rewards available
- Calendar connections

### 6. Admin (/admin)
- System metrics
- Household statistics
- Audit trail
- User activity

---

## ⚡ Quick Actions

### Generate a New Weekly Plan
```bash
# Option 1: Via UI
1. Go to /planner
2. Click "Generate New Plan"
3. Review assignments
4. Click "Publish Plan"

# Option 2: Via API
curl -X POST http://localhost:3000/api/admin/jobs/trigger \
  -H "Content-Type: application/json"
```

### View Notifications
- Click bell icon in header (when signed in)
- Or visit /notifications

### Check System Status
- Visit /admin for metrics
- See household performance
- View audit logs

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Update database schema
npm run db:migrate      # Create migration
npm run db:seed         # Seed test data
npm run db:studio       # Open Prisma Studio

# Quality
npm run lint            # Run ESLint
npm run typecheck      # TypeScript check
npm test               # Run tests
```

---

## 🎨 Features to Try

### 1. Task Completion Flow
1. Sign in as any user
2. Go to /planner
3. Complete a task
4. Watch XP increase!
5. Check streak updates

### 2. Gamification
1. Go to /profile
2. See XP and level
3. View earned badges
4. Check streak calendar
5. Browse available rewards

### 3. Plan Generation
1. Go to /planner
2. Generate new plan
3. Review fairness meter
4. Adjust if needed
5. Publish plan

### 4. Notifications
1. Click bell icon
2. See recent activity
3. Mark as read
4. Configure reminders in /settings

### 5. Admin Dashboard
1. Visit /admin
2. See system metrics
3. Check household stats
4. Review audit trail

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Authentication Not Working
- Development mode accepts ANY email/password
- Just enter any email and password
- User will be auto-created
- No OAuth setup needed!

### Missing Test Data
```bash
# Re-seed database
npm run db:seed
```

---

## 📚 Documentation

- **[COMPLETED_FEATURES.md](COMPLETED_FEATURES.md)** - All implemented features
- **[AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)** - Auth configuration guide
- **[UI_IMPROVEMENTS.md](UI_IMPROVEMENTS.md)** - Design system documentation
- **[API.md](API.md)** - API endpoint reference
- **[CALENDAR_INTEGRATION.md](CALENDAR_INTEGRATION.md)** - Calendar setup guide
- **[PWA_GUIDE.md](PWA_GUIDE.md)** - PWA installation guide

---

## 🎓 Next Steps

### For Development
1. Explore the codebase
2. Make changes and see live reload
3. Add your own features
4. Customize the design

### For Testing
1. Try all user flows
2. Test on mobile devices
3. Check different browsers
4. Install as PWA

### For Production
1. Set up OAuth credentials
2. Configure production database
3. Set environment variables
4. Deploy to hosting platform

---

## 💡 Pro Tips

- **Fast Reload**: Changes to React components reload instantly
- **Database Changes**: Run `npm run db:push` after schema changes
- **Type Safety**: TypeScript will catch errors before runtime
- **PWA Testing**: Use Chrome DevTools > Application > Service Workers
- **Authentication**: Development mode is VERY permissive for ease of testing

---

## 🆘 Need Help?

1. Check the documentation files
2. Review error messages in console
3. Check Next.js logs in terminal
4. Verify database with Prisma Studio: `npm run db:studio`

---

**Happy Task Scheduling! 🎉**

**Project Status:** ✅ Fully Functional & Ready to Use!
