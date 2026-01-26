# LandHud Internal Dashboard - BUILD_IDEA.md

## Table of Contents
1. [Project Overview](#project-overview)
2. [Company Context](#company-context)
3. [Technical Architecture](#technical-architecture)
4. [Page Specifications](#page-specifications)
5. [API Integrations](#api-integrations)
6. [Data Models](#data-models)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Development Roadmap](#development-roadmap)
9. [File Structure](#file-structure)
10. [Quick Start Guide](#quick-start-guide)

---

## Project Overview

### Purpose
Build an internal operations dashboard for LandHud that consolidates business metrics, property inventory, financial tracking, team training, contract generation, and performance reporting into a single unified platform.

### Success Criteria
- Team accesses dashboard daily as their primary operational tool
- Contract creation time reduced from 10+ minutes to <2 minutes
- All business metrics visible in real-time without manual spreadsheet updates
- Training materials centralized and easily searchable
- EOD reports submitted in <2 minutes with automatic data aggregation

### Core Principles
- **Speed**: Sub-1-second page loads
- **Simplicity**: Minimal clicks to accomplish tasks
- **Reliability**: Graceful error handling, no data loss
- **Clarity**: Information hierarchy focused on what matters most

---

## Company Context

### Business Model
LandHud operates as "Opendoor for vacant land" - making instant cash offers at 50-70% of market value on vacant land properties nationwide.

### Current Workflow
1. Pull property data from LandPortal
2. Clean and filter data (automated via n8n)
3. Import to LaunchControl for SMS campaigns
4. SMS VA team contacts 1,200+ landowners daily
5. Interested sellers flagged for underwriting
6. Underwriters research and value properties
7. Verbal offers made to sellers
8. Purchase agreements sent via PandaDoc
9. Contracts signed and deals closed
10. Properties listed for resale or held for appreciation

### Current Tech Stack
- **SMS Outreach**: LaunchControl
- **CRM**: Close.com
- **Underwriting**: Airtable
- **Contracts**: PandaDoc
- **Metrics Tracking**: Google Sheets (manual)
- **Data Source**: LandPortal
- **Automation**: n8n

### Pain Points
- Data scattered across 6+ disconnected tools
- No unified view of pipeline health
- Manual contract creation is time-consuming
- Training materials disorganized (Loom, Notion, Google Docs)
- KPI tracking requires manual Google Sheets updates
- No real-time inventory visibility
- Financial data not aggregated

---

## Technical Architecture

### Recommended Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui component library

**Backend:**
- Next.js API Routes (serverless functions)
- PostgreSQL or Supabase (database)
- Prisma ORM (database client)

**APIs & Integrations:**
- PandaDoc API (contract generation)
- Close.com API (CRM data)
- Future: Google Sheets API (metrics migration)
- Future: LaunchControl API (SMS metrics)

**Authentication:**
- NextAuth.js or Clerk
- Role-based access control (Admin, SMS VA, Underwriter)

**File Storage:**
- AWS S3 or Cloudflare R2 (training videos, documents)
- Alternative: Supabase Storage

**Deployment:**
- Vercel (recommended for Next.js)
- Railway or Render (alternatives)

**Analytics:**
- Vercel Analytics (page performance)
- PostHog or Mixpanel (user behavior - optional)

---

## Page Specifications

### 1. Dashboard Page (`/dashboard`)

#### Purpose
Real-time business metrics at a glance showing pipeline health, team performance, and key conversion rates.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Date Range Picker: [Last 7 Days ▼] [Custom Range]  │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Hot      │  │ Contracts│  │ Contracts│          │
│  │ Leads    │  │ Sent     │  │ Signed   │          │
│  │ 77       │  │ 37       │  │ 15       │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ Est. Exit Price     │  │ Estimated Pipeline  │  │
│  │ (Signed Contracts)  │  │ Profit              │  │
│  │ $1,260,000          │  │ $735,500            │  │
│  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Key Metrics

**Outreach Metrics:**
- Texts Sent (total outbound messages)
- Texts Received (responses from prospects)
- Response Rate (% calculation)

**Lead Metrics:**
- Leads (expressed interest in selling)
- Hot Leads (high intent, engaged prospects)
- Lead Conversion Rate (Leads / Texts Received)

**Contract Metrics:**
- Contracts Sent (PAs sent to sellers)
- Contracts Signed (executed deals)
- Contract Close Rate (Signed / Sent)

**Financial Metrics:**
- Est. Exit Price (sum of all signed contract resale values)
- Estimated Pipeline Profit (Est. Exit - Acquisition Costs)
- Average Deal Profit

#### Date Range Picker Options
- Last 7 Days
- Last 30 Days
- Last 90 Days
- Month to Date
- Quarter to Date
- Year to Date
- Custom Range (calendar picker)

#### Data Source
- **Phase 1**: Hardcoded or manual entry into database
- **Phase 2**: Close.com API (deal stages, contract status)
- **Phase 3**: LaunchControl API (SMS metrics)

#### Responsive Design
- Desktop: Full metric grid
- Tablet: 2-column metric grid
- Mobile: Single column, scrollable

---

### 2. Inventory Page (`/inventory`)

#### Purpose
Real-time view of all properties in the portfolio, organized by status: Owned, Listed, Sold, Preparing to List.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Inventory Overview                                   │
├─────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [County ▼] [Price Range ▼]     │
│ Search: [Search by APN, Address, County...]         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ OWNED (12)                                   │   │
│ │ ┌─────────────────────────────────────────┐ │   │
│ │ │ 123-45-678 | Mohave County, AZ          │ │   │
│ │ │ Est. Market Value: $15,000              │ │   │
│ │ │ Purchased: Jan 15, 2024                 │ │   │
│ │ │ [View Details] [List for Sale]          │ │   │
│ │ └─────────────────────────────────────────┘ │   │
│ │ [Additional property cards...]              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ LISTED ON MARKET (8)                         │   │
│ │ [Property cards with listing price, days     │   │
│ │  on market, platform (Zillow, LandWatch)]    │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ PREPARING TO LIST (4)                        │   │
│ │ [Property cards with prep tasks: photos,     │   │
│ │  research, description writing]              │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### Property Status Definitions

**Owned:**
- Properties acquired, closed, and now in portfolio
- Awaiting decision on hold vs. list for sale

**Listed on Market:**
- Actively advertised for sale
- Track listing platforms (Zillow, Realtor.com, LandWatch, Facebook)
- Days on market counter

**Sold:**
- Completed sales
- Track sale price, profit, days to sell

**Preparing to List:**
- Properties being readied for market
- Track prep tasks (photos, research, description)

#### Property Card Details

**Common Elements:**
- APN (Assessor's Parcel Number)
- Quick stats relevant to status

**Owned Status:**
- Purchase price
- Estimated market value
- Purchase date
- Holding time (days owned)
- Action buttons: [View Details] [List for Sale] [Mark as Sold]

**Listed Status:**
- Listing price
- Days on market
- Platform(s) listed on
- Lead inquiries count
- Action buttons: [View Listing] [Edit Price] [Mark as Sold]

**Sold Status:**
- Purchase price
- Sale price
- Gross profit
- Sale date
- Days from acquisition to sale
- Action buttons: [View Details]

**Preparing to List:**
- Estimated list price
- Prep checklist progress (3/5 tasks complete)
- Assigned team member
- Action buttons: [View Tasks] [Mark Ready to List]

#### Filters & Search

**Status Filter:**
- All
- Owned
- Listed
- Sold
- Preparing to List

**County Filter:**
- Multi-select dropdown
- Shows only counties where properties exist

**Price Range Filter:**
- <$5K
- $5K-$10K
- $10K-$20K
- $20K-$50K
- $50K+
- Custom range

**Search:**
- Real-time search by APN, address, county name
- Instant filtering as you type

#### Summary Stats (Top of Page)
```
Total Properties: 47
Total Invested: $387,500
Current Portfolio Value: $682,000
Properties Sold (All-Time): 23
Total Revenue from Sales: $541,000
```

#### Data Source
- PostgreSQL/Supabase database
- `properties` table with status field
- Close.com API integration for deal stages (future)

---

### 3. Financials Page (`/financials`)

#### Purpose
Comprehensive financial overview showing all money in and out of the business, categorized by expense type and revenue streams.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Financials Overview                                  │
├─────────────────────────────────────────────────────┤
│ Date Range: [Month to Date ▼] [Custom Range]        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│ │ Total       │  │ Total       │  │ Net         │  │
│ │ Revenue     │  │ Expenses    │  │ Profit      │  │
│ │ $125,000    │  │ $67,300     │  │ $57,700     │  │
│ └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ EXPENSES BREAKDOWN                           │   │
│ ├──────────────────────────────────────────────┤   │
│ │ Category            │ Amount    │ % of Total │   │
│ │ ─────────────────────────────────────────── │   │
│ │ Property Acquisitions│ $38,500  │ 57.2%     │   │
│ │ Team Payroll         │ $18,000  │ 26.7%     │   │
│ │ Marketing/Ads        │ $3,500   │ 5.2%      │   │
│ │ Software/Apps        │ $4,100   │ 6.1%      │   │
│ │ Legal/Closing        │ $3,200   │ 4.8%      │   │
│ │ ─────────────────────────────────────────── │   │
│ │ TOTAL EXPENSES       │ $67,300  │ 100%      │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ REVENUE BREAKDOWN                            │   │
│ ├──────────────────────────────────────────────┤   │
│ │ Source              │ Amount    │ % of Total │   │
│ │ ─────────────────────────────────────────── │   │
│ │ Property Sales      │ $115,000  │ 92.0%     │   │
│ │ Assignment Fees     │ $8,000    │ 6.4%      │   │
│ │ Consultation Fees   │ $2,000    │ 1.6%      │   │
│ │ ─────────────────────────────────────────── │   │
│ │ TOTAL REVENUE       │ $125,000  │ 100%      │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ DETAILED EXPENSE CATEGORIES                  │   │
│ ├──────────────────────────────────────────────┤   │
│ │ 📦 Software/Apps ($4,100)                    │   │
│ │ • Close.com CRM: $1,200                      │   │
│ │ • LaunchControl SMS: $1,500                  │   │
│ │ • LandPortal Data: $800                      │   │
│ │ • PandaDoc: $300                             │   │
│ │ • Airtable: $200                             │   │
│ │ • Other Tools: $100                          │   │
│ ├──────────────────────────────────────────────┤   │
│ │ 👥 Team Payroll ($18,000)                    │   │
│ │ • SMS VA 1: $3,000                           │   │
│ │ • SMS VA 2: $2,000                           │   │
│ │ • Underwriter 1: $3,500                      │   │
│ │ • Underwriter 2: $3,500                      │   │
│ │ • Admin Support: $1,000                      │   │
│ ├──────────────────────────────────────────────┤   │
│ │ 🏠 Property Acquisitions ($38,500)           │   │
│ │ • 5 properties acquired this period          │   │
│ │ • Average acquisition: $7,700                │   │
│ ├──────────────────────────────────────────────┤   │
│ │ ⚖️ Legal/Closing Costs ($3,200)              │   │
│ │ • Title/Escrow Fees: $2,100                  │   │
│ │ • Legal Review: $800                         │   │
│ │ • Recording Fees: $300                       │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### Expense Categories

**Property Acquisitions:**
- Land purchase costs
- Total amount spent acquiring properties
- Link to specific properties purchased

**Team Payroll:**
- SMS VAs (cold outreach team)
- Underwriters (property valuation specialists)
- Admin/support staff
- Breakdown by team member or role

**Marketing/Ads:**
- SMS campaign credits (LaunchControl)
- Facebook Ads (if running)
- Google Ads (if running)
- Other advertising platforms
- Direct mail (if applicable)

**Software/Apps:**
- Close.com (CRM)
- LaunchControl (SMS platform)
- LandPortal (data provider)
- PandaDoc (contract management)
- Airtable (underwriting workflows)
- n8n (automation - if paid tier)
- Other SaaS tools

**Legal/Closing Costs:**
- Title company fees
- Escrow fees
- Legal review costs
- Recording fees
- Notary costs

**Misc/Other:**
- Bank fees
- Transaction costs
- Unexpected expenses
- Petty cash items

#### Revenue Categories

**Property Sales:**
- Revenue from selling owned properties
- Primary revenue stream
- Track by individual sale

**Assignment Fees:**
- Wholesaling deals (assigning contracts)
- Fee collected for deal facilitation

**Consultation Fees:**
- Coaching/consulting services (if applicable)
- Educational products (if applicable)

#### Pipeline Value Section

**Metrics:**
- Total value of properties under contract (not yet closed)
- Estimated closing costs to subtract
- Net expected proceeds from pipeline
- Number of deals in pipeline

**Purpose:**
- Forward-looking revenue visibility
- Cash flow planning
- Understanding near-term capital needs

#### Data Entry Methods

**Phase 1:**
- Manual entry via admin form
- Categories are predefined dropdowns
- Amounts and dates entered manually

**Phase 2:**
- Integration with accounting software (QuickBooks, Xero)
- Automated expense categorization
- Bank feed integration

**Phase 3:**
- AI-powered receipt scanning
- Automatic categorization from bank transactions
- Real-time financial dashboards

#### Charts & Visualizations

**Expense Pie Chart:**
- Visual breakdown of expense categories
- Interactive (click to see detail)

**Revenue vs. Expense Line Chart:**
- Monthly trend over time
- Shows profitability trajectory

**Profit Margin Trend:**
- Net profit % over time
- Helps identify seasonality or trends

#### Export Functionality
- Export to CSV/Excel
- Custom date range reports
- Category-specific exports
- Tax reporting formats

---

### 4. Internal Training Page (`/training`)

#### Purpose
Centralized Learning Management System (LMS) containing all training materials organized by role, topic, and skill level.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Internal Training                                    │
├─────────────────────────────────────────────────────┤
│ Filter by Role: [All ▼] [SMS VA] [Underwriter]      │
│ Search: [Search training content...]                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📚 CHAPTER 1: SMS Outreach Fundamentals      │   │
│ │ Progress: 3/5 Complete                       │   │
│ ├──────────────────────────────────────────────┤   │
│ │ ✅ 1.1 Introduction to Cold SMS (12 min)     │   │
│ │    [Video] [Download Script Template]        │   │
│ │                                              │   │
│ │ ✅ 1.2 LaunchControl Platform Overview (8min)│   │
│ │    [Video] [Platform Login Guide]            │   │
│ │                                              │   │
│ │ ✅ 1.3 Daily Workflow & Best Practices (15min│   │
│ │    [Video] [Checklist Download]              │   │
│ │                                              │   │
│ │ ⬜ 1.4 Handling Objections (18 min)          │   │
│ │    [Video] [Objection Response Scripts]      │   │
│ │                                              │   │
│ │ ⬜ 1.5 Booking Sales Calls (10 min)          │   │
│ │    [Video] [Calendar Booking Guide]          │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📚 CHAPTER 2: Property Underwriting          │   │
│ │ Progress: 0/5 Complete                       │   │
│ ├──────────────────────────────────────────────┤   │
│ │ ⬜ 2.1 Introduction to Land Valuation (20min)│   │
│ │    [Video] [Valuation Framework PDF]         │   │
│ │                                              │   │
│ │ ⬜ 2.2 Pulling Comparable Sales (15 min)     │   │
│ │    [Video] [ReAPI Tutorial] [Prycd Guide]    │   │
│ │                                              │   │
│ │ ⬜ 2.3 County Research & GIS Tools (25 min)  │   │
│ │    [Video] [County Assessor Links Database]  │   │
│ │                                              │   │
│ │ ⬜ 2.4 Identifying Red Flags (18 min)        │   │
│ │    [Video] [Red Flags Checklist]             │   │
│ │                                              │   │
│ │ ⬜ 2.5 Zoning & Development Potential (22min)│   │
│ │    [Video] [Zoning Research Guide]           │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📚 CHAPTER 3: Sales & Closing                │   │
│ │ Progress: Not Started                        │   │
│ ├──────────────────────────────────────────────┤   │
│ │ ⬜ 3.1 Pre-Call Preparation (8 min)          │   │
│ │ ⬜ 3.2 Sales Call Framework (20 min)         │   │
│ │ ⬜ 3.3 Overcoming Seller Objections (25 min) │   │
│ │ ⬜ 3.4 Contract Walkthrough (15 min)         │   │
│ │ ⬜ 3.5 Following Up After PA Sent (10 min)   │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📚 CHAPTER 4: Advanced Topics                │   │
│ │ Progress: Not Started                        │   │
│ ├──────────────────────────────────────────────┤   │
│ │ ⬜ 4.1 Subdivision Potential Analysis (30min)│   │
│ │ ⬜ 4.2 Title Issues & How to Resolve (20min) │   │
│ │ ⬜ 4.3 Tax Implications for Sellers (18 min) │   │
│ │ ⬜ 4.4 1031 Exchange Basics (12 min)         │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 🎥 RECORDED SALES CALLS (Reference Library)  │   │
│ ├──────────────────────────────────────────────┤   │
│ │ • "Seller Concerned About Capital Gains" (12m│   │
│ │ • "Seller Has Emotional Attachment" (15 min) │   │
│ │ • "Seller Thinks Property Worth More" (18min)│   │
│ │ • "Seller Has Mortgage/Liens" (10 min)       │   │
│ │ • "Seller Wants All Cash Quick Close" (8 min)│   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### Features

**Progress Tracking:**
- Per user, per chapter
- Visual progress bars
- Checkmarks for completed sections
- Total time invested in training

**Content Types:**

**Video Lessons:**
- Screen recordings with narration
- Live demonstrations
- Real examples from actual deals
- Hosted on Cloudflare Stream, Vimeo, or S3

**Downloadable Resources:**
- PDF guides
- Script templates
- Checklists
- Spreadsheet tools
- County assessor link databases

**Recorded Sales Calls:**
- Real calls with sellers (with permission)
- Searchable by objection type or scenario
- Transcripts available
- Timestamps for key moments

#### Chapter Breakdown

**Chapter 1: SMS Outreach Fundamentals** (For SMS VAs)
- Platform training (LaunchControl)
- Message scripting
- Daily workflow and quotas
- Response handling
- Booking calls

**Chapter 2: Property Underwriting** (For Underwriters)
- Land valuation basics
- Comparable sales research
- County research tools
- GIS and parcel data
- Red flags identification
- Zoning analysis
- Airtable submission process

**Chapter 3: Sales & Closing** (For Closers/Founder)
- Pre-call research
- Sales call framework
- Objection handling
- Contract explanation
- Follow-up strategies

**Chapter 4: Advanced Topics** (All Roles)
- Subdivision potential analysis
- Title issue resolution
- Tax strategies for sellers
- 1031 exchanges
- Creative deal structures

**Recorded Calls Library:**
- Organized by scenario/objection
- Fully searchable
- Timestamped key moments
- Best practices highlighted

#### User Experience Features

**Video Player:**
- Playback speed control (0.5x to 2x)
- Closed captions/transcripts
- Bookmark key moments
- Resume where you left off
- Mobile-friendly

**Search Functionality:**
- Full-text search across all content
- Filter by role, chapter, topic
- Search within transcripts

**Progress Tracking:**
- Individual user progress
- Admin view: team-wide completion rates
- Required vs. optional content
- Certification/completion badges (future)

**Downloadable Resources:**
- One-click downloads
- Organized by chapter
- Version tracking (updated materials)

#### Admin Capabilities

**Content Management:**
- Upload new videos
- Edit chapter/section titles
- Reorder content
- Archive outdated materials
- Add/remove downloadable resources

**Analytics:**
- Most-watched videos
- Average completion rates
- User engagement metrics
- Time spent in training

**User Management:**
- Assign required training by role
- Track individual completion
- Send reminders for incomplete training

#### Data Storage

**Videos:**
- Cloud storage (S3, Cloudflare R2, Vimeo)
- CDN for fast streaming
- Adaptive bitrate (multiple quality levels)

**Progress Data:**
- PostgreSQL/Supabase database
- `user_progress` table tracking:
  - user_id
  - chapter_id
  - section_id
  - completed (boolean)
  - completed_at (timestamp)
  - time_spent (seconds)

**Downloadable Resources:**
- S3 or Supabase Storage
- Public URLs or signed URLs for security

#### Mobile Responsiveness
- Fully responsive design
- Mobile video player optimized
- Downloadable resources accessible on mobile
- Progress syncs across devices

---

### 5. Send a Contract Page (`/send-contract`)

#### Purpose
Streamlined contract generation using PandaDoc API, reducing contract creation time from 10+ minutes to under 2 minutes.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Send a Contract                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ CONTRACT DETAILS                             │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Agreement Date:                              │   │
│ │ [Date Picker: Today's Date]                  │   │
│ │                                              │   │
│ │ Seller(s) Name:                              │   │
│ │ [Text Input: John & Jane Doe]                │   │
│ │                                              │   │
│ │ Buyer:                                       │   │
│ │ [Text Input: LandHud LLC]                    │   │
│ │                                              │   │
│ │ Property Address:                            │   │
│ │ [Text Input: County Road 45, Mohave, AZ]     │   │
│ │                                              │   │
│ │ Parcel ID (APN):                             │   │
│ │ [Text Input: 123-45-678]                     │   │
│ │                                              │   │
│ │ Legal Description:                           │   │
│ │ [Text Area: LOT 12, BLOCK 3, SUBDIVISION...] │   │
│ │                                              │   │
│ ├──────────────────────────────────────────────┤   │
│ │ FINANCIAL TERMS                              │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Purchase Price:                              │   │
│ │ [Currency Input: $12,500.00]                 │   │
│ │                                              │   │
│ │ Earnest Money Deposit:                       │   │
│ │ [Number Input: $500.00]                      │   │
│ │ Due within: [Number: 3] business days        │   │
│ │                                              │   │
│ │ Deposit Refundability:                       │   │
│ │ ○ Refundable   ● Non-refundable              │   │
│ │                                              │   │
│ ├──────────────────────────────────────────────┤   │
│ │ TIMELINE                                     │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Closing Date:                                │   │
│ │ [Date Picker: MM/DD/YYYY]                    │   │
│ │                                              │   │
│ │ Due Diligence Period:                        │   │
│ │ [Number Input: 14] days                      │   │
│ │                                              │   │
│ ├──────────────────────────────────────────────┤   │
│ │ PROPERTY DETAILS                             │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Parcel County:                               │   │
│ │ [Dropdown: Mohave County, AZ ▼]              │   │
│ │                                              │   │
│ │ Additional Terms:                            │   │
│ │ [Text Area:                                  │   │
│ │  - Property sold AS-IS                       │   │
│ │  - Buyer responsible for survey costs        │   │
│ │  - Seller to provide clear title            │   │
│ │ ]                                            │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ [Button: Generate & Send Contract]           │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Clear Form]  [Save as Draft]                       │
└─────────────────────────────────────────────────────┘
```

#### Form Fields

**Agreement Details:**
- **Agreement Date**: Date picker (defaults to today)
- **Seller(s) Name**: Text input (supports multiple names: "John & Jane Doe")
- **Buyer**: Text input (default: "LandHud LLC")
- **Property Address**: Text input (full address)
- **Parcel ID (APN)**: Text input (Assessor's Parcel Number)
- **Legal Description**: Text area (from county records)

**Financial Terms:**
- **Purchase Price**: Currency input (with formatting)
- **Earnest Money Deposit**: Currency input
- **Earnest Money Due**: Number input + "business days"
- **Deposit Refundability**: Radio buttons (Refundable / Non-refundable)

**Timeline:**
- **Closing Date**: Date picker
- **Due Diligence Period**: Number input + "days"

**Property Details:**
- **Parcel County**: Dropdown (pre-populated with common counties)
- **Additional Terms**: Text area (custom clauses, special conditions)

#### Workflow

**Step 1: Fill Form**
- User enters all contract details
- Form validation ensures required fields completed
- Real-time formatting (currency, dates)

**Step 2: Preview (Optional)**
- Click "Preview Contract in PandaDoc"
- Opens PandaDoc preview in modal or new tab
- User can review before sending
- Return to form to make edits if needed

**Step 3: Generate & Send**
- Click "Generate & Send Contract"
- Backend API call to PandaDoc
- Creates document from template
- Populates all fields with form data
- Sends to seller's email for signature
- Returns PandaDoc document URL

**Step 4: Confirmation**
- Success message with document link
- Option to view in PandaDoc
- Document logged in system
- Email sent to seller with signing instructions

#### PandaDoc API Integration

**Template Setup:**
- Pre-configured Purchase Agreement template in PandaDoc
- Fields mapped to form inputs
- Signature blocks configured
- Branding/logo included

**API Workflow:**
```
1. POST /documents - Create document from template
   - Include all form field values
   - Set recipient (seller email from Close.com or manual entry)

2. POST /documents/{id}/send - Send for signature
   - Email to seller
   - SMS notification (optional)

3. Webhook listener - Track document status
   - Viewed by seller
   - Signed by seller
   - Completed
   - Update database with status
```

**Document Status Tracking:**
- Draft (created, not sent)
- Sent (awaiting signature)
- Viewed (seller opened document)
- Signed (seller completed signature)
- Completed (all parties signed)

#### Form Helpers

**Auto-Fill from Close.com (Future Enhancement):**
- Dropdown: "Select Deal from Close.com"
- Auto-populate seller name, property details, offer amount
- Reduces manual entry

**Save as Draft:**
- Save incomplete form
- Return later to finish
- Useful for complex deals requiring research

**Template Presets:**
- "Standard Cash Offer"
- "Wholesale Assignment"
- "Owner Financing"
- Pre-fill common terms based on deal type

#### Validation Rules

**Required Fields:**
- Agreement Date
- Seller Name
- Property Address
- Parcel ID
- Purchase Price
- Closing Date
- Parcel County

**Optional Fields:**
- Additional Terms
- Custom clauses

**Format Validation:**
- Currency fields: positive numbers, max 2 decimals
- Dates: valid dates, closing date > today
- Numbers: positive integers for days/business days

#### Error Handling

**PandaDoc API Errors:**
- Display user-friendly error message
- Log technical error for debugging
- Offer retry or manual workaround
- Examples:
  - "Template not found" → Check PandaDoc setup
  - "Invalid recipient email" → Verify seller email
  - "API rate limit" → Wait and retry

**Form Errors:**
- Inline validation (red highlights, error messages)
- Cannot submit until all required fields valid
- Clear error messages ("Purchase Price must be greater than $0")

#### User Experience Enhancements

**Field Pre-Fill:**
- Default values for common fields (Buyer = "LandHud LLC")
- Remember last used county
- Auto-format as user types (currency, phone numbers)

**Tooltips:**
- Question mark icons with helpful hints
- "Legal Description: Copy from county assessor records"
- "Due Diligence Period: Typically 14-30 days"

**Character Counters:**
- For text areas (Additional Terms)
- Ensure fields don't exceed PandaDoc limits

**Mobile Optimization:**
- Responsive form layout
- Mobile-friendly date pickers
- Easy input on small screens

#### Data Storage

**Contract Records Table:**
- contract_id (unique identifier)
- created_by (user who generated)
- created_at (timestamp)
- seller_name
- property_address
- purchase_price
- pandadoc_document_id (link to PandaDoc)
- status (draft, sent, signed, completed)
- sent_at (timestamp)
- signed_at (timestamp)

**Audit Trail:**
- Track all contract generations
- Link contracts to Close.com deals (future)
- Historical record of all agreements

#### Security Considerations

**PandaDoc API Key:**
- Stored as environment variable (never client-side)
- Rotated regularly
- Scoped with minimum necessary permissions

**Data Privacy:**
- Seller information encrypted at rest
- HTTPS for all API calls
- PII handled according to privacy policy

#### Future Enhancements

**Phase 2:**
- Integration with Close.com (auto-fill from deal records)
- Bulk contract generation (multiple deals at once)
- Contract templates for different deal types

**Phase 3:**
- E-signature tracking dashboard
- Automated reminders for unsigned contracts
- Contract analytics (time to signature, completion rates)

---

### 6. Submit EOD Report Page (`/submit-eod-report`)

#### Purpose
Streamlined end-of-day reporting for team members to log daily performance metrics, replacing manual Google Sheets entry.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Submit End-of-Day Report                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Select Your Role:                                    │
│ ● Cold SMS Team Member   ○ Underwriter              │
│                                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ COLD SMS TEAM MEMBER - EOD REPORT                   │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ DAILY METRICS                                │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Texts Sent Today:                            │   │
│ │ [Number Input: 1,200]                        │   │
│ │ Daily Target: 1,200 ✅                       │   │
│ │                                              │   │
│ │ Texts Received (Responses):                  │   │
│ │ [Number Input: 47]                           │   │
│ │ Response Rate: 3.9% (auto-calculated)        │   │
│ │                                              │   │
│ │ Interested Leads Generated:                  │   │
│ │ [Number Input: 12]                           │   │
│ │ Lead Conversion Rate: 25.5% (auto-calc)      │   │
│ │                                              │   │
│ │ Hot Leads (High Intent):                     │   │
│ │ [Number Input: 3]                            │   │
│ │                                              │   │
│ │ Sales Calls Booked:                          │   │
│ │ [Number Input: 1]                            │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ CHALLENGES & NOTES                           │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Any issues or challenges today?              │   │
│ │ [Text Area:                                  │   │
│ │  - LaunchControl was slow this morning       │   │
│ │  - Several wrong numbers in Mohave list      │   │
│ │ ]                                            │   │
│ │                                              │   │
│ │ Wins or insights:                            │   │
│ │ [Text Area:                                  │   │
│ │  - New script variation got 2x response rate │   │
│ │  - Booked call with seller owning 10+ parcels│   │
│ │ ]                                            │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Submit Report] [Save as Draft] [Clear Form]        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ UNDERWRITER - EOD REPORT                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ DAILY METRICS                                │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Properties Researched/Comped:                │   │
│ │ [Number Input: 12]                           │   │
│ │                                              │   │
│ │ Properties Approved for Offer:               │   │
│ │ [Number Input: 8]                            │   │
│ │ Approval Rate: 66.7% (auto-calculated)       │   │
│ │                                              │   │
│ │ Properties Rejected/Passed:                  │   │
│ │ [Number Input: 4]                            │   │
│ │                                              │   │
│ │ Average Time per Comp:                       │   │
│ │ [Number Input: 18] minutes                   │   │
│ │                                              │   │
│ │ Total Hours Worked Today:                    │   │
│ │ [Number Input: 6.5] hours                    │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ PROPERTY INSIGHTS                            │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Counties worked in today:                    │   │
│ │ [Multi-select: Mohave, Coconino, Yavapai ▼]  │   │
│ │                                              │   │
│ │ Red flags encountered:                       │   │
│ │ ☑ Access issues                              │   │
│ │ ☑ Title problems                             │   │
│ │ ☐ Zoning restrictions                        │   │
│ │ ☐ Environmental concerns                     │   │
│ │ ☐ Liens/encumbrances                         │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ CHALLENGES & NOTES                           │   │
│ ├──────────────────────────────────────────────┤   │
│ │                                              │   │
│ │ Research challenges or blockers:             │   │
│ │ [Text Area:                                  │   │
│ │  - Yavapai County GIS down most of day       │   │
│ │  - Couldn't find comps for remote parcel     │   │
│ │ ]                                            │   │
│ │                                              │   │
│ │ Learning or insights:                        │   │
│ │ [Text Area:                                  │   │
│ │  - Found new comp source for rural land      │   │
│ │  - Discovered subdivision opportunity        │   │
│ │ ]                                            │   │
│ │                                              │   │
│ │ Properties needing manager review:           │   │
│ │ [Text Area:                                  │   │
│ │  - APN 123-45-678: Possible subdivision play │   │
│ │  - APN 987-65-432: Title issue, legal review │   │
│ │ ]                                            │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Submit Report] [Save as Draft] [Clear Form]        │
└─────────────────────────────────────────────────────┘
```

#### Form Fields

**COLD SMS TEAM MEMBER REPORT:**

**Daily Metrics:**
- **Texts Sent Today**: Number input
  - Compares to daily target (1,200)
  - Visual indicator: green checkmark if met, red X if below
- **Texts Received (Responses)**: Number input
  - Auto-calculates Response Rate (Received / Sent × 100%)
- **Interested Leads Generated**: Number input
  - Auto-calculates Lead Conversion Rate (Leads / Responses × 100%)
- **Hot Leads (High Intent)**: Number input
  - Subset of interested leads showing strong buying signals
- **Sales Calls Booked**: Number input

**Challenges & Notes:**
- **Issues or Challenges**: Text area (optional)
  - System outages, technical problems, list quality issues
- **Wins or Insights**: Text area (optional)
  - Script variations that worked, big opportunities, patterns noticed

---

**UNDERWRITER REPORT:**

**Daily Metrics:**
- **Properties Researched/Comped**: Number input
- **Properties Approved for Offer**: Number input
  - Auto-calculates approval rate (Approved / Researched × 100%)
- **Properties Rejected/Passed**: Number input
- **Average Time per Comp**: Number input (minutes)
- **Total Hours Worked Today**: Number input (decimal, e.g., 6.5)

**Property Insights:**
- **Counties Worked In Today**: Multi-select dropdown
  - Pre-populated with common counties
- **Red Flags Encountered**: Checkboxes
  - Access issues
  - Title problems
  - Zoning restrictions
  - Environmental concerns
  - Liens/encumbrances
  - Other (with text input for custom)

**Challenges & Notes:**
- **Research Challenges or Blockers**: Text area
  - County website outages, missing data, difficult properties
- **Learning or Insights**: Text area
  - Market trends, new research tools, efficiency improvements
- **Properties Needing Manager Review**: Text area
  - Flag complex deals requiring founder's attention
  - Include APN and brief reason

#### Workflow

**Step 1: Role Selection**
- User selects role (Cold SMS or Underwriter)
- Form updates to show role-specific fields
- Role selection remembered for future sessions

**Step 2: Fill Form**
- Date defaults to today (can be changed for late submissions)
- Name dropdown (pulls from user database or manual entry)
- Fill in all metrics
- Auto-calculations happen in real-time
- Optional fields for notes/challenges

**Step 3: Submit**
- Validation ensures required fields completed
- Click "Submit Report"
- Data saved to database
- Success confirmation message
- Option to submit another report

**Step 4: Data Processing**
- Report data written to database
- Aggregates update on Dashboard page
- Historical trends calculated
- Team performance metrics updated

#### Auto-Calculations

**SMS Team:**
- Response Rate = (Texts Received / Texts Sent) × 100%
- Conversion Rate = (Interested Leads / Texts Received) × 100%
- Target Achievement = Visual indicator if texts sent ≥ 1,200

**Underwriter:**
- Approval Rate = (Approved / Researched) × 100%
- Productivity = Properties per hour (Researched / Hours Worked)
- Rejection Rate = (Rejected / Researched) × 100%

#### Validation Rules

**Required Fields:**

*SMS Team:*
- Report Date
- Team Member Name
- Texts Sent
- Texts Received
- Interested Leads

*Underwriter:*
- Report Date
- Team Member Name
- Properties Researched
- Properties Approved
- Properties Rejected
- Hours Worked

**Optional Fields:**
- All text areas (challenges, notes, insights)
- Hot Leads (SMS team)
- Counties worked (Underwriter)
- Red flags (Underwriter)

**Format Validation:**
- Numbers must be non-negative integers (except hours = decimal)
- Date cannot be future date
- Percentages calculated automatically, not manually entered

#### Data Storage

**EOD Reports Table:**
```sql
eod_reports (
  id (primary key)
  user_id (foreign key → users table)
  report_date (date)
  role (enum: 'sms_va', 'underwriter')
  created_at (timestamp)

  -- SMS VA specific fields
  texts_sent (integer)
  texts_received (integer)
  interested_leads (integer)
  hot_leads (integer)
  calls_booked (integer)

  -- Underwriter specific fields
  properties_researched (integer)
  properties_approved (integer)
  properties_rejected (integer)
  avg_time_per_comp (integer, minutes)
  hours_worked (decimal)
  counties_worked (text array)
  red_flags (text array)

  -- Common fields
  challenges (text)
  wins_insights (text)
  manager_review_needed (text)
)
```

**Indexes:**
- user_id + report_date (for retrieving user's reports)
- report_date (for dashboard aggregations)
- role + report_date (for role-specific analytics)

#### Dashboard Integration

**Data Flows to Dashboard:**
- Daily aggregates calculated from EOD reports
- Weekly/monthly rollups
- Team performance comparisons
- Trend analysis over time

**Dashboard Queries:**
```
Total Texts Sent (Date Range) = SUM(texts_sent) WHERE report_date IN range
Total Leads = SUM(interested_leads) WHERE report_date IN range
Avg Response Rate = AVG(texts_received / texts_sent) WHERE report_date IN range
Properties Comped = SUM(properties_researched) WHERE role = 'underwriter'
```

#### User Experience

**Save as Draft:**
- Incomplete reports saved
- User can return and complete later
- Drafts auto-deleted after 7 days

**Pre-Fill from Previous Day:**
- Option to copy yesterday's metrics as starting point
- User adjusts numbers rather than starting from zero
- Useful for consistent daily targets

**Mobile Optimization:**
- Fully responsive form
- Large touch targets for mobile input
- Number keyboard for numeric fields
- Easy to submit on-the-go

**Submission Confirmation:**
- Success message: "EOD Report submitted for [Date]!"
- Display submitted metrics for verification
- Option to edit (within same day)
- Link to view historical reports

#### Analytics & Reporting

**Admin Dashboard View:**
- Team-wide EOD report completion rate
- Average metrics by team member
- Identify top performers
- Spot trends (declining response rates, longer comp times)

**Individual User View:**
- Personal historical reports
- Performance trends over time
- Goal tracking (hit 1,200 texts X days this month)

#### Future Enhancements

**Phase 2:**
- Auto-populate metrics from LaunchControl API (SMS counts)
- Auto-populate from Airtable (properties comped)
- Reduce manual entry to just notes/qualitative data

**Phase 3:**
- Gamification: badges for streaks, hitting targets
- Leaderboards: friendly competition
- Automated insights: "Your response rate is up 15% this week!"

**Phase 4:**
- Voice input for notes (mobile)
- Scheduled reminders to submit EOD reports
- Integration with Slack (submit report via Slack bot)

---

## API Integrations

### PandaDoc API

**Purpose:** Contract generation and e-signature workflow

**Endpoints Used:**

**1. Create Document from Template**
```
POST https://api.pandadoc.com/public/v1/documents
Authorization: API-Key {YOUR_API_KEY}
Content-Type: application/json

Body:
{
  "template_uuid": "TEMPLATE_ID",
  "name": "Purchase Agreement - {Seller Name}",
  "recipients": [
    {
      "email": "seller@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "Seller"
    }
  ],
  "tokens": [
    { "name": "Seller.Name", "value": "John Doe" },
    { "name": "Property.Address", "value": "123 Main St" },
    { "name": "Purchase.Price", "value": "$12,500.00" },
    { "name": "Earnest.Money", "value": "$500.00" },
    { "name": "Closing.Date", "value": "03/15/2024" },
    { "name": "Due.Diligence", "value": "14 days" },
    { "name": "Parcel.APN", "value": "123-45-678" },
    { "name": "Legal.Description", "value": "LOT 12..." },
    { "name": "Agreement.Date", "value": "02/01/2024" },
    { "name": "Buyer.Name", "value": "LandHud LLC" },
    { "name": "Additional.Terms", "value": "Property sold AS-IS" },
    { "name": "County", "value": "Mohave County, AZ" }
  ]
}

Response:
{
  "id": "DOCUMENT_ID",
  "status": "document.draft",
  "name": "Purchase Agreement - John Doe",
  ...
}
```

**2. Send Document for Signature**
```
POST https://api.pandadoc.com/public/v1/documents/{DOCUMENT_ID}/send
Authorization: API-Key {YOUR_API_KEY}
Content-Type: application/json

Body:
{
  "message": "Please review and sign this Purchase Agreement.",
  "silent": false
}

Response:
{
  "id": "DOCUMENT_ID",
  "status": "document.sent",
  ...
}
```

**3. Get Document Status**
```
GET https://api.pandadoc.com/public/v1/documents/{DOCUMENT_ID}
Authorization: API-Key {YOUR_API_KEY}

Response:
{
  "id": "DOCUMENT_ID",
  "status": "document.completed", // or document.sent, document.viewed
  "recipients": [...],
  "date_created": "...",
  "date_completed": "..."
}
```

**4. Webhook for Real-Time Updates**
```
Configure webhook in PandaDoc dashboard:
URL: https://your-domain.com/api/webhooks/pandadoc
Events: document_state_changed

Webhook Payload:
{
  "event": "document_state_changed",
  "data": {
    "id": "DOCUMENT_ID",
    "status": "document.completed",
    "name": "Purchase Agreement - John Doe"
  }
}
```

**API Key Storage:**
- Environment variable: `PANDADOC_API_KEY`
- Never exposed to client-side code
- Rotated every 90 days

**Template Setup:**
- Create Purchase Agreement template in PandaDoc dashboard
- Define fields/tokens matching form inputs
- Configure signature blocks
- Add company branding/logo

**Error Handling:**
- API rate limits: 100 requests/minute
- Retry logic with exponential backoff
- User-friendly error messages for failures

**Cost Considerations:**
- PandaDoc pricing based on documents sent per month
- Track usage to stay within plan limits
- Consider bulk operations for cost efficiency

---

### Close.com API

**Purpose:** CRM integration for deal data, contact info, pipeline stages

**Endpoints Used:**

**1. Get Leads (Contacts)**
```
GET https://api.close.com/api/v1/lead/
Authorization: Basic {BASE64_ENCODED_API_KEY}

Response:
{
  "data": [
    {
      "id": "lead_abc123",
      "display_name": "John Doe",
      "contacts": [
        {
          "name": "John Doe",
          "emails": [{"email": "john@example.com"}],
          "phones": [{"phone": "+15551234567"}]
        }
      ],
      "custom": {
        "Property APN": "123-45-678",
        "Property Address": "123 Main St, Mohave County, AZ"
      },
      ...
    }
  ]
}
```

**2. Get Opportunities (Deals)**
```
GET https://api.close.com/api/v1/opportunity/
Authorization: Basic {BASE64_ENCODED_API_KEY}

Query Parameters:
?_fields=lead_id,status_label,value,confidence
&lead_id=lead_abc123

Response:
{
  "data": [
    {
      "id": "oppo_xyz789",
      "lead_id": "lead_abc123",
      "status_label": "Verbal Yes",
      "value": 12500,
      "confidence": 80,
      "date_created": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**3. Update Opportunity Status**
```
PUT https://api.close.com/api/v1/opportunity/{OPPORTUNITY_ID}/
Authorization: Basic {BASE64_ENCODED_API_KEY}
Content-Type: application/json

Body:
{
  "status_label": "Contract Sent"
}

Response:
{
  "id": "oppo_xyz789",
  "status_label": "Contract Sent",
  ...
}
```

**4. Get Custom Fields**
```
GET https://api.close.com/api/v1/custom_field/lead/
Authorization: Basic {BASE64_ENCODED_API_KEY}

Response:
{
  "data": [
    {
      "id": "cf_xxx",
      "name": "Property APN",
      "type": "text"
    },
    {
      "id": "cf_yyy",
      "name": "Offer Amount",
      "type": "number"
    }
  ]
}
```

**5. Create Activity (Log Contract Sent)**
```
POST https://api.close.com/api/v1/activity/note/
Authorization: Basic {BASE64_ENCODED_API_KEY}
Content-Type: application/json

Body:
{
  "lead_id": "lead_abc123",
  "note": "Purchase Agreement sent via PandaDoc. Document ID: DOCUMENT_ID"
}
```

**Authentication:**
- API key stored as environment variable: `CLOSE_API_KEY`
- Basic auth: base64 encode API key
- Example: `Authorization: Basic base64(API_KEY + ':')`

**Use Cases:**

**Send a Contract Page:**
- Fetch lead/opportunity details to pre-fill contract form
- Dropdown: "Select Deal from Close.com"
- Auto-populate seller name, property address, offer amount
- After contract sent, update opportunity status to "Contract Sent"

**Dashboard Page:**
- Pull deal counts by status (Interested, Verbal Yes, Contract Sent, Closed)
- Calculate metrics: contracts sent, contracts signed
- Display pipeline value (sum of opportunity values)

**Future - Inventory Page:**
- Link properties to Close.com opportunities
- Track which properties came from which deals
- Sync status updates (Owned → Listed → Sold)

**Rate Limits:**
- Close.com: 600 requests per minute
- Implement caching for frequently accessed data
- Use webhooks for real-time updates instead of polling

**Webhooks (Future Enhancement):**
```
Configure webhook in Close.com:
URL: https://your-domain.com/api/webhooks/close
Events: opportunity.status_change, lead.created

Webhook Payload:
{
  "event": "opportunity.status_change",
  "data": {
    "id": "oppo_xyz789",
    "status_label": "Verbal Yes"
  }
}
```

**Error Handling:**
- Invalid API key → User-friendly error message
- Lead not found → Search by different criteria
- Network timeout → Retry with exponential backoff

---

## Data Models

### Database Schema

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'sms_va', 'underwriter'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

**Properties Table**
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apn VARCHAR(100) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  county VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  acreage DECIMAL(10, 2),
  zoning VARCHAR(100),
  legal_description TEXT,

  -- Financial
  purchase_price DECIMAL(10, 2),
  estimated_market_value DECIMAL(10, 2),
  listing_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),

  -- Status tracking
  status VARCHAR(50) NOT NULL, -- 'owned', 'listed', 'sold', 'preparing_to_list'
  purchased_date DATE,
  listed_date DATE,
  sold_date DATE,

  -- Listing details
  listing_platforms TEXT[], -- ['Zillow', 'LandWatch', 'Facebook']
  days_on_market INTEGER,

  -- Metadata
  close_lead_id VARCHAR(100), -- Link to Close.com
  pandadoc_contract_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**EOD Reports Table**
```sql
CREATE TABLE eod_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  report_date DATE NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'sms_va', 'underwriter'

  -- SMS VA metrics
  texts_sent INTEGER,
  texts_received INTEGER,
  interested_leads INTEGER,
  hot_leads INTEGER,
  calls_booked INTEGER,

  -- Underwriter metrics
  properties_researched INTEGER,
  properties_approved INTEGER,
  properties_rejected INTEGER,
  avg_time_per_comp INTEGER, -- minutes
  hours_worked DECIMAL(4, 2),
  counties_worked TEXT[],
  red_flags TEXT[],

  -- Common fields
  challenges TEXT,
  wins_insights TEXT,
  manager_review_needed TEXT,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, report_date) -- One report per user per day
);
```

**Contracts Table**
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id),

  -- Contract details
  agreement_date DATE NOT NULL,
  seller_name VARCHAR(255) NOT NULL,
  buyer VARCHAR(255) NOT NULL,
  property_address TEXT NOT NULL,
  parcel_id VARCHAR(100) NOT NULL,
  legal_description TEXT,

  -- Financial terms
  purchase_price DECIMAL(10, 2) NOT NULL,
  earnest_money DECIMAL(10, 2),
  earnest_money_due_days INTEGER,
  deposit_refundable BOOLEAN,

  -- Timeline
  closing_date DATE NOT NULL,
  due_diligence_days INTEGER,

  -- Property details
  parcel_county VARCHAR(100) NOT NULL,
  additional_terms TEXT,

  -- PandaDoc integration
  pandadoc_document_id VARCHAR(255),
  pandadoc_status VARCHAR(50), -- 'draft', 'sent', 'viewed', 'signed', 'completed'
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  signed_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Metadata
  close_opportunity_id VARCHAR(100), -- Link to Close.com deal
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Training Content Table**
```sql
CREATE TABLE training_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  role VARCHAR(50), -- 'all', 'sms_va', 'underwriter'
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES training_chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT, -- S3/Cloudflare URL
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  resources JSONB, -- [{name: 'Script Template', url: '...'}]
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  section_id UUID REFERENCES training_sections(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER DEFAULT 0,

  UNIQUE(user_id, section_id)
);
```

**Financial Transactions Table**
```sql
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'property_acquisition', 'payroll', 'marketing', 'software', 'legal', 'misc'
  subcategory VARCHAR(100), -- 'Close.com', 'Facebook Ads', 'Underwriter 1'
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'expense', 'revenue'
  property_id UUID REFERENCES properties(id), -- Optional link to property
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Dashboard Metrics Cache Table** (Optional - for performance)
```sql
CREATE TABLE dashboard_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  date_range VARCHAR(50) NOT NULL, -- 'last_7_days', 'last_30_days', etc.
  value JSONB NOT NULL, -- Store metric value(s)
  calculated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(metric_name, date_range)
);
```

### Indexes for Performance
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Properties
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_county ON properties(county);
CREATE INDEX idx_properties_close_lead_id ON properties(close_lead_id);

-- EOD Reports
CREATE INDEX idx_eod_reports_user_date ON eod_reports(user_id, report_date);
CREATE INDEX idx_eod_reports_date ON eod_reports(report_date);
CREATE INDEX idx_eod_reports_role ON eod_reports(role);

-- Contracts
CREATE INDEX idx_contracts_pandadoc_status ON contracts(pandadoc_status);
CREATE INDEX idx_contracts_created_by ON contracts(created_by);

-- Training Progress
CREATE INDEX idx_training_progress_user ON user_training_progress(user_id);
CREATE INDEX idx_training_progress_section ON user_training_progress(section_id);

-- Financial Transactions
CREATE INDEX idx_financial_date ON financial_transactions(date);
CREATE INDEX idx_financial_category ON financial_transactions(category);
CREATE INDEX idx_financial_type ON financial_transactions(type);
```

---

## User Roles & Permissions

### Role Definitions

**Admin (Founder)**
- Full access to all pages and features
- Create/edit/delete users
- Manage training content
- View all team EOD reports
- Access financial data
- Generate contracts
- Manage inventory

**SMS VA (Cold Outreach Team)**
- Access: Dashboard (view only), Training, Submit EOD Report
- Cannot: Access Financials, Inventory (for now)
- Can: View team performance metrics, submit daily reports

**Underwriter (Property Valuation Specialist)**
- Access: Dashboard (view only), Training, Submit EOD Report
- Cannot: Access Financials (for now), Send Contracts
- Can: View deal pipeline metrics, submit daily reports

### Permission Matrix

| Feature | Admin | SMS VA | Underwriter |
|---------|-------|--------|-------------|
| Dashboard (View) | ✅ | ✅ | ✅ |
| Inventory (View) | ✅ | ❌ | ❌ |
| Inventory (Edit) | ✅ | ❌ | ❌ |
| Financials (View) | ✅ | ❌ | ❌ |
| Financials (Edit) | ✅ | ❌ | ❌ |
| Training (View) | ✅ | ✅ | ✅ |
| Training (Manage) | ✅ | ❌ | ❌ |
| Send Contract | ✅ | ❌ | ❌ |
| Submit EOD Report | ✅ | ✅ | ✅ |
| View All EOD Reports | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |

### Future Role Expansion

**Phase 2 Roles:**
- **Closer/Sales**: Access to contracts, sales call recordings
- **Marketing Manager**: Access to marketing spend, campaign performance
- **Finance Manager**: Full financial access, limited operational access

**Phase 3 Permissions:**
- Granular permissions (e.g., "can view but not edit financials")
- Team leads (e.g., Senior SMS VA with limited admin)

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Setup & Infrastructure**
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS
- [ ] Install shadcn/ui base components
- [ ] Configure PostgreSQL/Supabase database
- [ ] Set up authentication (NextAuth.js or Clerk)
- [ ] Create basic layout with navigation
- [ ] Deploy to Vercel (staging environment)

**Week 2: Dashboard Page**
- [ ] Design metric cards component
- [ ] Implement date range picker
- [ ] Create dashboard layout
- [ ] Build API route for metrics (hardcoded for now)
- [ ] Add auto-refresh functionality
- [ ] Responsive design testing
- [ ] Performance optimization (<1s load time)

**Week 3: Training Page**
- [ ] Design chapter/section components
- [ ] Build video player with controls
- [ ] Implement progress tracking
- [ ] Create admin upload interface
- [ ] Set up cloud storage (S3/Cloudflare R2)
- [ ] Add search functionality
- [ ] Test on mobile devices

**Week 4: Actions Pages**
- [ ] Build Send Contract form
- [ ] Integrate PandaDoc API
- [ ] Create EOD Report forms (both roles)
- [ ] Implement form validation
- [ ] Set up database tables for contracts & reports
- [ ] Build confirmation flows
- [ ] Error handling & user feedback

### Phase 2: API Integrations (Weeks 5-6)

**Week 5: PandaDoc Integration**
- [ ] Create PandaDoc template
- [ ] Build API wrapper functions
- [ ] Implement webhook listener for status updates
- [ ] Add contract status tracking
- [ ] Build contract history view
- [ ] Test end-to-end contract flow
- [ ] Document API usage

**Week 6: Close.com Integration**
- [ ] Set up Close.com API credentials
- [ ] Build API wrapper functions
- [ ] Implement deal/lead fetching
- [ ] Pre-fill contract form from Close data
- [ ] Update Close when contracts sent
- [ ] Test data sync reliability
- [ ] Handle API errors gracefully

### Phase 3: Inventory & Financials (Weeks 7-8)

**Week 7: Inventory Page**
- [ ] Design property card components
- [ ] Build status filter system
- [ ] Implement search functionality
- [ ] Create property detail modals
- [ ] Add property CRUD operations (admin only)
- [ ] Build property status workflow
- [ ] Test with real property data

**Week 8: Financials Page**
- [ ] Design expense/revenue breakdown tables
- [ ] Build transaction entry form (admin)
- [ ] Implement category management
- [ ] Create charts/visualizations
- [ ] Add export to CSV functionality
- [ ] Calculate pipeline value
- [ ] Test financial calculations

### Phase 4: Polish & Launch (Week 9-10)

**Week 9: Testing & Refinement**
- [ ] End-to-end testing all workflows
- [ ] User acceptance testing with team
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility improvements
- [ ] Mobile testing across devices
- [ ] Bug fixes and refinements

**Week 10: Training & Launch**
- [ ] Create user documentation
- [ ] Record training videos for team
- [ ] Migrate existing data (contracts, properties)
- [ ] Team onboarding sessions
- [ ] Production deployment
- [ ] Monitor for issues
- [ ] Gather user feedback

### Future Phases (Post-Launch)

**Phase 5: Automation**
- Automated metrics pulling from LaunchControl/Close.com
- Reduce manual EOD report entry
- Scheduled reports/email digests
- Smart notifications (contract signed, new hot lead)

**Phase 6: Advanced Features**
- Property Quick Lookup tool
- Automated valuation engine
- Deal queue/pipeline view
- Internal messaging system
- Mobile app (React Native)

**Phase 7: Intelligence**
- AI-powered insights ("Your response rate is trending down")
- Predictive analytics (forecast monthly closings)
- Automated anomaly detection (unusual expense, low performance)
- Smart recommendations (best counties to target)

---

## File Structure
```
landhud-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── inventory/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── financials/
│   │   └── page.tsx
│   ├── training/
│   │   ├── page.tsx
│   │   └── [chapterId]/
│   │       └── [sectionId]/
│   │           └── page.tsx
│   ├── actions/
│   │   ├── send-contract/
│   │   │   └── page.tsx
│   │   └── eod-report/
│   │       └── page.tsx
│   ├── api/
│   │   ├── dashboard/
│   │   │   └── route.ts (metrics endpoint)
│   │   ├── contracts/
│   │   │   ├── route.ts (create contract)
│   │   │   └── [id]/
│   │   │       └── route.ts (get/update contract)
│   │   ├── eod-reports/
│   │   │   └── route.ts (submit report)
│   │   ├── properties/
│   │   │   └── route.ts (CRUD properties)
│   │   ├── training/
│   │   │   └── route.ts (chapters, sections, progress)
│   │   ├── financials/
│   │   │   └── route.ts (transactions)
│   │   └── webhooks/
│   │       ├── pandadoc/
│   │       │   └── route.ts
│   │       └── close/
│   │           └── route.ts
│   ├── layout.tsx (root layout)
│   └── page.tsx (home/redirect)
├── components/
│   ├── ui/ (shadcn components)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── ConversionFunnel.tsx
│   ├── inventory/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyFilters.tsx
│   │   └── PropertyDetail.tsx
│   ├── financials/
│   │   ├── ExpenseBreakdown.tsx
│   │   ├── RevenueChart.tsx
│   │   └── TransactionTable.tsx
│   ├── training/
│   │   ├── ChapterCard.tsx
│   │   ├── SectionList.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── ProgressBar.tsx
│   ├── contracts/
│   │   ├── ContractForm.tsx
│   │   └── ConfirmationModal.tsx
│   └── eod-report/
│       ├── SMSVAForm.tsx
│       └── UnderwriterForm.tsx
├── lib/
│   ├── api/
│   │   ├── pandadoc.ts (PandaDoc API client)
│   │   ├── close.ts (Close.com API client)
│   │   └── database.ts (DB queries)
│   ├── utils/
│   │   ├── formatting.ts (currency, dates)
│   │   ├── validation.ts (form validation)
│   │   └── calculations.ts (metrics, percentages)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   └── useTraining.ts
│   └── constants/
│       ├── routes.ts
│       └── config.ts
├── prisma/ (if using Prisma ORM)
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── images/
│   ├── icons/
│   └── documents/
├── types/
│   ├── user.ts
│   ├── property.ts
│   ├── contract.ts
│   ├── training.ts
│   └── financial.ts
├── middleware.ts (auth, role-based access)
├── .env.local (environment variables)
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Quick Start Guide

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Supabase)
- PandaDoc account with API access
- Close.com account with API access
- Git installed

### Step 1: Clone & Install
```bash
# Clone repository (or create new Next.js app)
npx create-next-app@latest landhud-dashboard --typescript --tailwind --app

cd landhud-dashboard

# Install dependencies
npm install @prisma/client prisma
npm install next-auth # or clerk
npm install axios
npm install date-fns
npm install recharts # (for charts)

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog dropdown-menu table
```

### Step 2: Environment Setup

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/landhud"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# APIs
PANDADOC_API_KEY="your-pandadoc-api-key"
PANDADOC_TEMPLATE_ID="your-template-id"
CLOSE_API_KEY="your-close-api-key"

# Storage (if using S3)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="landhud-training-videos"

# App Config
NODE_ENV="development"
```

### Step 3: Database Setup
```bash
# Initialize Prisma
npx prisma init

# Create tables (using schema from Data Models section)
npx prisma migrate dev --name init

# Seed with initial data
node prisma/seed.ts
```

### Step 4: Start Development
```bash
npm run dev
# Open http://localhost:3000
```

### Step 5: First Tasks

**Task 1: Set Up Authentication**
- Install NextAuth.js or Clerk
- Create login/signup pages
- Protect routes with middleware
- Create initial admin user

**Task 2: Build Dashboard Layout**
- Create `app/layout.tsx` with Navbar and Sidebar
- Implement navigation between pages
- Add user menu with logout

**Task 3: Build Dashboard Page**
- Create MetricCard component
- Build DateRangePicker
- Implement hardcoded metrics (for now)
- Test responsive design

---

## Success Metrics

### Technical Metrics
- Page load time: <1 second
- API response time: <500ms
- Uptime: 99.9%
- Mobile responsiveness: 100% of pages
- Accessibility score: 90+ (Lighthouse)

### User Adoption Metrics
- Daily active users: 100% of team
- EOD report completion rate: >90%
- Contract generation usage: >80% of deals
- Training completion rate: 70% within 30 days
- User satisfaction: 4/5 stars

### Business Impact Metrics
- Contract creation time: <2 minutes (from 10+)
- Time saved per week: 10+ hours (team-wide)
- Data entry errors: <5% (from ~20% in spreadsheets)
- Pipeline visibility: Real-time vs. 1-day lag
- Decision speed: 2x faster with centralized data

---

## Support & Maintenance

### Documentation
- User guide (how to use each page)
- API documentation (for future developers)
- Troubleshooting guide (common issues)
- Changelog (track all updates)

### Monitoring
- Error tracking (Sentry or similar)
- Performance monitoring (Vercel Analytics)
- User behavior analytics (PostHog)
- API usage tracking (rate limits, costs)

### Backup & Recovery
- Daily database backups
- Point-in-time recovery capability
- File storage backups (training videos)
- Disaster recovery plan

### Updates & Maintenance
- Weekly: Review error logs, fix critical bugs
- Monthly: Performance optimization, security patches
- Quarterly: Feature releases, user feedback implementation
- Annually: Major version upgrades, tech stack review

---

**This dashboard will become the operational backbone of LandHud, centralizing data, streamlining workflows, and empowering the team to scale efficiently.**
