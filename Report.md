# Property Dealer CRM System — Assignment Report
## CS-4032 Web Programming | Assignment 03
### Student: 23i-0007 | Section: A

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [Authentication Flow](#authentication-flow)
5. [Database Design](#database-design)
6. [Business Logic](#business-logic)
7. [Middleware](#middleware)
8. [UI Screenshots](#ui-screenshots)
9. [Demo Video](#demo-video)
10. [Deployment](#deployment)

---

## System Overview

The **Property Dealer CRM System** is a full-stack Level 3 CRM designed for Pakistani real estate agents. It centralizes lead management from sources like Facebook Ads, Walk-ins, and Website inquiries, providing a professional platform for tracking, scoring, and converting property leads.

**Key Features Implemented:**
- ✅ Secure JWT Authentication (NextAuth + bcrypt)
- ✅ Role-Based Access Control (Admin / Agent)
- ✅ Full Lead CRUD with auto-scoring
- ✅ Real-time updates via SWR polling (10-15s interval)
- ✅ Analytics Dashboard with Recharts visualizations
- ✅ WhatsApp click-to-chat integration
- ✅ Email notifications via Nodemailer (HTML templates)
- ✅ Activity Timeline / Audit Trail
- ✅ Smart Follow-up Reminder System
- ✅ Rate Limiting middleware
- ✅ Stale & overdue lead detection

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | Full-stack React framework |
| **TypeScript** | Type safety |
| **MongoDB + Mongoose** | Database & ODM |
| **NextAuth v4** | Authentication (JWT strategy) |
| **bcryptjs** | Password hashing |
| **SWR** | Client-side data fetching + polling |
| **Recharts** | Analytics charts (Bar, Pie) |
| **Nodemailer** | Email notifications |
| **Tailwind CSS v4** | Utility-first styling |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting |
| **react-hot-toast** | Toast notifications |

---

## Architecture & Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         — Login UI with demo credentials
│   │   └── signup/page.tsx        — Account creation
│   ├── admin/
│   │   ├── page.tsx               — Admin analytics dashboard
│   │   ├── leads/
│   │   │   ├── page.tsx           — All leads table + filters
│   │   │   ├── new/page.tsx       — Create new lead form
│   │   │   └── [id]/page.tsx      — Lead detail + edit + timeline
│   │   ├── agents/page.tsx        — Agent management
│   │   └── analytics/page.tsx     — Deep analytics view
│   ├── agent/
│   │   ├── page.tsx               — Agent dashboard
│   │   └── leads/
│   │       ├── page.tsx           — Assigned leads
│   │       └── [id]/page.tsx      — Lead detail for agents
│   ├── api/
│   │   ├── auth/[...nextauth]/    — NextAuth route handler
│   │   ├── signup/                — User registration
│   │   ├── leads/                 — Lead CRUD endpoints
│   │   ├── users/                 — User listing (admin only)
│   │   └── analytics/             — Aggregated stats
│   ├── providers.tsx              — SessionProvider + Toaster
│   └── layout.tsx                 — Root layout
├── components/
│   ├── Sidebar.tsx                — Navigation sidebar (role-aware)
│   ├── DashboardLayout.tsx        — Page wrapper
│   ├── LeadTable.tsx              — Reusable leads table
│   └── StatCard.tsx               — Analytics stat card
├── lib/
│   ├── mongodb.ts                 — Connection singleton
│   ├── authOptions.ts             — NextAuth configuration
│   ├── email.ts                   — Nodemailer templates
│   ├── scoring.ts                 — Lead priority logic
│   └── rateLimiter.ts             — In-memory rate limiter
├── models/
│   ├── User.ts                    — User schema (bcrypt pre-save)
│   ├── Lead.ts                    — Lead schema (auto-score pre-save)
│   └── ActivityLog.ts             — Audit trail schema
├── middleware.ts                  — Route protection (NextAuth)
└── types/
    └── next-auth.d.ts             — Extended session types
```

---

## Authentication Flow

1. User submits email + password via `/login`
2. NextAuth `CredentialsProvider.authorize()` queries MongoDB
3. `bcrypt.compare()` validates the password hash
4. On success, JWT is issued containing `{ id, name, email, role }`
5. `callbacks.jwt` stores role in token; `callbacks.session` exposes it to client
6. `middleware.ts` (NextAuth `withAuth`) protects `/admin/*` and `/agent/*` routes
7. Admin visiting `/agent/*` is redirected to `/admin`; non-authenticated users go to `/login`

---

## Database Design

### User Model
```typescript
{
  name: String,       email: String (unique),
  password: String,   role: 'admin' | 'agent',
  phone: String,      timestamps: true
}
// Pre-save hook: bcrypt.hash(password, 12)
```

### Lead Model
```typescript
{
  name, email, phone, propertyInterest: String,
  budget: Number,
  status: 'New' | 'Contacted' | 'In Progress' | 'Closed' | 'Lost',
  priority: 'High' | 'Medium' | 'Low',  // Auto-computed
  score: Number,                          // 100 / 60 / 20
  source: 'Facebook Ads' | 'Walk-in' | 'Website' | 'Referral' | 'Other',
  assignedTo: ObjectId (ref: User),
  followUpDate: Date,
  lastActivityAt: Date,
  notes: String,
  timestamps: true
}
// Pre-save hook: computeScore(budget)
```

### ActivityLog Model
```typescript
{
  lead: ObjectId (ref: Lead),
  performedBy: ObjectId (ref: User),
  action: 'lead_created' | 'lead_updated' | 'lead_assigned' |
          'lead_reassigned' | 'status_changed' | 'notes_updated' |
          'followup_set' | 'lead_deleted',
  description: String,
  metadata: Mixed,
  timestamps: true
}
```

---

## Business Logic

### Lead Scoring (Backend — `models/Lead.ts` pre-save hook)
```
Budget > 20,000,000 PKR  →  Score: 100  →  Priority: HIGH
Budget 10M – 20M PKR     →  Score: 60   →  Priority: MEDIUM
Budget < 10,000,000 PKR  →  Score: 20   →  Priority: LOW
```
Score is calculated automatically on create AND on budget update.

### Lead Assignment
- Admin selects an agent from dropdown on lead detail page
- PATCH `/api/leads/[id]` with `{ assignedTo: agentId }`
- `ActivityLog` entry created (`lead_assigned` or `lead_reassigned`)
- Assignment email sent to agent via Nodemailer

### Follow-up Detection
- **Overdue**: `followUpDate < now` AND status ∉ Closed/Lost
- **Stale**: `lastActivityAt < now - 7 days` AND status ∉ Closed/Lost
- Both highlighted in dashboards with color banners and warning icons

### Real-time Updates (SWR Polling)
- Admin Dashboard: refreshes every **15 seconds**
- Lead tables: refreshes every **10 seconds**
- Analytics: refreshes every **30 seconds**
- Deployed on Vercel — Socket.io not used (serverless incompatible)

---

## Middleware

### 1. Authentication Middleware (`src/middleware.ts`)
- Uses `withAuth` from `next-auth/middleware`
- Protects all `/admin/*`, `/agent/*`, and `/api/leads/*` routes
- Unauthorized → redirected to `/login`
- Wrong role → redirected to appropriate dashboard

### 2. Validation Middleware (inline in API routes)
- Required field checks on all POST/PATCH endpoints
- Budget validated as positive number
- Email normalized to lowercase
- Meaningful error messages with correct HTTP status codes

### 3. Rate Limiting (`src/lib/rateLimiter.ts`)
- In-memory store with sliding window (60s)
- **Agents**: 50 requests/minute
- **Admins**: 10,000 requests/minute (effectively unlimited)
- Returns `429 Too Many Requests` with `Retry-After` header

---

## UI Screenshots

### Admin Dashboard — Analytics Overview

> **[PASTE SCREENSHOT HERE]**
> *(Navigate to http://localhost:3000/admin after login with admin@crm.com / admin123)*

---

### Leads Management Page

> **[PASTE SCREENSHOT HERE]**
> *(Navigate to http://localhost:3000/admin/leads)*

---

### Lead Detail with Activity Timeline

> **[PASTE SCREENSHOT HERE]**
> *(Click any lead row → view timeline + edit form)*

---

### Analytics Section (Charts & Insights)

> **[PASTE SCREENSHOT HERE]**
> *(Navigate to http://localhost:3000/admin/analytics)*

---

### Agent Dashboard — Assigned Leads

> **[PASTE SCREENSHOT HERE]**
> *(Login with agent@crm.com / agent123, navigate to /agent)*

---

### Login Page

> **[PASTE SCREENSHOT HERE]**
> *(Navigate to http://localhost:3000/login)*

---

## Demo Video

> A demo video showcasing the system functionality (lead creation, assignment, real-time updates, WhatsApp integration, email notifications) is available separately.

---

## Deployment

- **Recommended**: Deploy to [Vercel](https://vercel.com) — connect GitHub repository
- Set environment variables in Vercel dashboard matching `.env.example`
- MongoDB Atlas is already configured and accessible

### Environment Variables Required
```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.vercel.app
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@crm.com | admin123 |
| Agent | agent@crm.com | agent123 |
| Agent 2 | sara@crm.com | agent123 |

---

*Property Dealer CRM System — CS-4032 Assignment 03 | Built with Next.js, MongoDB, NextAuth*
