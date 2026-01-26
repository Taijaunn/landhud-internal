# LandHud Internal Dashboard - PLAN OF ACTION

> **Last Updated:** January 2026
> **Status:** Phase 1 - Foundation

---

## What's Already Done ✅

- [x] Next.js 16 project initialized with TypeScript
- [x] Tailwind CSS configured
- [x] shadcn/ui component library installed (dashboard-shell-06)
- [x] Sidebar navigation with 4 pages
- [x] Dashboard page with sample charts/widgets
- [x] Placeholder pages created (Training, Send Contract, EOD Report)
- [x] Environment variables file (`.env`) with all API placeholders
- [x] Project specification (`BUILD_IDEAS.md`)

---

## Phase 1: Foundation (Current Phase)

### Step 1.1: Database Setup 🔲
**Priority: HIGH | Estimated: 2-3 hours**

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init
```

**Tasks:**
- [ ] Choose database provider (Supabase recommended for speed)
- [ ] Create Supabase project and get connection string
- [ ] Add `DATABASE_URL` to `.env`
- [ ] Create Prisma schema with all tables from BUILD_IDEAS.md:
  - [ ] `users` table
  - [ ] `properties` table
  - [ ] `eod_reports` table
  - [ ] `contracts` table
  - [ ] `training_chapters` table
  - [ ] `training_sections` table
  - [ ] `user_training_progress` table
  - [ ] `financial_transactions` table
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Generate Prisma client

**Files to create:**
- `prisma/schema.prisma`
- `lib/db.ts` (Prisma client singleton)

---

### Step 1.2: Authentication Setup 🔲
**Priority: HIGH | Estimated: 3-4 hours**

**Option A: Clerk (Recommended - faster setup)**
```bash
npm install @clerk/nextjs
```

**Option B: NextAuth.js**
```bash
npm install next-auth @auth/prisma-adapter
```

**Tasks:**
- [ ] Choose auth provider (Clerk or NextAuth)
- [ ] Create account and get API keys
- [ ] Add credentials to `.env`
- [ ] Set up auth middleware (`middleware.ts`)
- [ ] Create sign-in/sign-up pages
- [ ] Protect dashboard routes
- [ ] Add user role field (admin, sms_va, underwriter)
- [ ] Create initial admin user

**Files to create:**
- `middleware.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `lib/auth.ts`

---

### Step 1.3: Dashboard - Real Metrics 🔲
**Priority: HIGH | Estimated: 4-5 hours**

Currently the dashboard shows sample data. Need to connect to real data.

**Tasks:**
- [ ] Create API route for dashboard metrics (`app/api/dashboard/route.ts`)
- [ ] Replace hardcoded StatisticsCardData with database queries
- [ ] Implement date range filtering (Last 7 days, 30 days, etc.)
- [ ] Create metrics calculation functions:
  - [ ] Total texts sent (from EOD reports)
  - [ ] Total leads generated
  - [ ] Contracts sent/signed (from contracts table)
  - [ ] Pipeline value calculation
- [ ] Add auto-refresh functionality (every 5 minutes)
- [ ] Create loading states

**Files to create/modify:**
- `app/api/dashboard/route.ts`
- `app/dashboard-shell-06/page.tsx` (modify)
- `lib/api/dashboard.ts`

---

### Step 1.4: EOD Report - Functional Form 🔲
**Priority: HIGH | Estimated: 4-5 hours**

This feeds data into the dashboard, so it should be built early.

**Tasks:**
- [ ] Create role selection (SMS VA vs Underwriter)
- [ ] Build SMS VA form:
  - [ ] Texts Sent input
  - [ ] Texts Received input
  - [ ] Interested Leads input
  - [ ] Hot Leads input
  - [ ] Calls Booked input
  - [ ] Auto-calculate Response Rate
  - [ ] Challenges/Notes textarea
- [ ] Build Underwriter form:
  - [ ] Properties Researched input
  - [ ] Properties Approved input
  - [ ] Properties Rejected input
  - [ ] Avg Time per Comp input
  - [ ] Hours Worked input
  - [ ] Counties multi-select
  - [ ] Red Flags checkboxes
- [ ] Create API route to save reports (`app/api/eod-reports/route.ts`)
- [ ] Add form validation
- [ ] Show submission confirmation
- [ ] Prevent duplicate submissions (one per user per day)

**Files to create/modify:**
- `app/submit-eod-report/page.tsx` (rebuild)
- `components/eod-report/SMSVAForm.tsx`
- `components/eod-report/UnderwriterForm.tsx`
- `app/api/eod-reports/route.ts`

---

## Phase 2: Core Features

### Step 2.1: Send Contract - PandaDoc Integration 🔲
**Priority: HIGH | Estimated: 6-8 hours**

**Prerequisites:**
- PandaDoc account with API access
- Purchase Agreement template created in PandaDoc

**Tasks:**
- [ ] Set up PandaDoc account and create template
- [ ] Map template fields to form inputs
- [ ] Add `PANDADOC_API_KEY` and `PANDADOC_TEMPLATE_ID` to `.env`
- [ ] Build contract form with all fields:
  - [ ] Agreement Date
  - [ ] Seller Name
  - [ ] Buyer (default: LandHud LLC)
  - [ ] Property Address
  - [ ] Parcel ID (APN)
  - [ ] Legal Description
  - [ ] Purchase Price
  - [ ] Earnest Money
  - [ ] Closing Date
  - [ ] Due Diligence Period
  - [ ] County dropdown
  - [ ] Additional Terms
- [ ] Create PandaDoc API wrapper (`lib/api/pandadoc.ts`)
- [ ] Implement document creation endpoint
- [ ] Implement document sending endpoint
- [ ] Add webhook listener for status updates
- [ ] Save contract records to database
- [ ] Show confirmation with PandaDoc link

**Files to create:**
- `app/send-contract/page.tsx` (rebuild)
- `components/contracts/ContractForm.tsx`
- `app/api/contracts/route.ts`
- `app/api/webhooks/pandadoc/route.ts`
- `lib/api/pandadoc.ts`

---

### Step 2.2: Training Page - LMS Foundation 🔲
**Priority: MEDIUM | Estimated: 6-8 hours**

**Tasks:**
- [ ] Create chapter/section data structure
- [ ] Build ChapterCard component (collapsible)
- [ ] Build SectionItem component (video + resources)
- [ ] Implement video player with:
  - [ ] Playback speed control
  - [ ] Progress tracking
  - [ ] Resume where left off
- [ ] Create progress tracking API
- [ ] Build admin interface to add content (Phase 2.5)
- [ ] Set up cloud storage for videos (S3/R2/Supabase)
- [ ] Add search functionality
- [ ] Filter by role (SMS VA, Underwriter, All)

**Files to create:**
- `app/internal-training/page.tsx` (rebuild)
- `components/training/ChapterCard.tsx`
- `components/training/SectionItem.tsx`
- `components/training/VideoPlayer.tsx`
- `components/training/ProgressBar.tsx`
- `app/api/training/route.ts`
- `app/api/training/progress/route.ts`

---

### Step 2.3: Close.com Integration 🔲
**Priority: MEDIUM | Estimated: 4-5 hours**

**Tasks:**
- [ ] Add `CLOSE_API_KEY` to `.env`
- [ ] Create Close.com API wrapper (`lib/api/close.ts`)
- [ ] Implement lead/deal fetching
- [ ] Add "Select Deal from Close.com" dropdown to contract form
- [ ] Auto-populate contract form from Close data
- [ ] Update Close.com when contract is sent
- [ ] Pull pipeline metrics for dashboard

**Files to create:**
- `lib/api/close.ts`
- Modify `app/send-contract/page.tsx`
- Modify `app/api/dashboard/route.ts`

---

## Phase 3: Inventory & Financials

### Step 3.1: Inventory Page 🔲
**Priority: MEDIUM | Estimated: 6-8 hours**

**Tasks:**
- [ ] Create `/inventory` route
- [ ] Build PropertyCard component
- [ ] Implement status sections (Owned, Listed, Sold, Preparing)
- [ ] Add filters (Status, County, Price Range)
- [ ] Add search (APN, Address)
- [ ] Create property detail modal
- [ ] Build admin CRUD for properties
- [ ] Add summary stats header
- [ ] Connect to properties table

**Files to create:**
- `app/inventory/page.tsx`
- `app/inventory/[id]/page.tsx`
- `components/inventory/PropertyCard.tsx`
- `components/inventory/PropertyFilters.tsx`
- `components/inventory/PropertyDetail.tsx`
- `app/api/properties/route.ts`

---

### Step 3.2: Financials Page 🔲
**Priority: LOW | Estimated: 6-8 hours**

**Tasks:**
- [ ] Create `/financials` route
- [ ] Build summary cards (Revenue, Expenses, Net Profit)
- [ ] Create expense breakdown table
- [ ] Create revenue breakdown table
- [ ] Add transaction entry form (admin only)
- [ ] Implement category management
- [ ] Build charts (expense pie, revenue trend)
- [ ] Add export to CSV
- [ ] Calculate pipeline value

**Files to create:**
- `app/financials/page.tsx`
- `components/financials/ExpenseBreakdown.tsx`
- `components/financials/RevenueChart.tsx`
- `components/financials/TransactionForm.tsx`
- `app/api/financials/route.ts`

---

## Phase 4: Polish & Launch

### Step 4.1: Role-Based Access Control 🔲
**Priority: HIGH | Estimated: 3-4 hours**

**Tasks:**
- [ ] Implement middleware for route protection
- [ ] Hide sidebar items based on role
- [ ] Protect API routes by role
- [ ] Add "View All EOD Reports" for admin
- [ ] Restrict Inventory/Financials to admin

---

### Step 4.2: Testing & QA 🔲
**Priority: HIGH | Estimated: 4-6 hours**

**Tasks:**
- [ ] Test all form submissions
- [ ] Test PandaDoc integration end-to-end
- [ ] Test on mobile devices
- [ ] Fix any UI/UX issues
- [ ] Performance optimization
- [ ] Error handling review

---

### Step 4.3: Production Deployment 🔲
**Priority: HIGH | Estimated: 2-3 hours**

**Tasks:**
- [ ] Set up Vercel project
- [ ] Configure production environment variables
- [ ] Set up production database
- [ ] Configure custom domain (if needed)
- [ ] Enable Vercel Analytics
- [ ] Deploy and test

---

## Recommended Build Order

```
Week 1:
├── Step 1.1: Database Setup (Day 1)
├── Step 1.2: Authentication (Day 2-3)
├── Step 1.4: EOD Report Form (Day 4-5)
└── Step 1.3: Dashboard Real Metrics (Day 6-7)

Week 2:
├── Step 2.1: Send Contract + PandaDoc (Day 1-3)
└── Step 2.2: Training Page (Day 4-7)

Week 3:
├── Step 2.3: Close.com Integration (Day 1-2)
├── Step 3.1: Inventory Page (Day 3-5)
└── Step 4.1: Role-Based Access (Day 6-7)

Week 4:
├── Step 3.2: Financials Page (Day 1-3)
├── Step 4.2: Testing & QA (Day 4-5)
└── Step 4.3: Production Deployment (Day 6-7)
```

---

## Quick Commands Reference

```bash
# Start development server
npm run dev

# Database commands
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma studio  # Visual database editor

# Add shadcn components
npx shadcn@latest add <component_name>

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Next Immediate Action

**Start with Step 1.1: Database Setup**

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy the connection string to `.env`
3. Run `npm install prisma @prisma/client`
4. Run `npx prisma init`
5. Create the schema from BUILD_IDEAS.md

Would you like me to help you start with database setup?
