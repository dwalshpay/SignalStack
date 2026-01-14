# SignalStack PRD
## B2B Ad Signal Optimisation Tool

**Version:** 1.0  
**Date:** January 2026  
**Owner:** pay.com.au Marketing

---

## Table of Contents

1. [Project Status](#project-status)
2. [Overview](#overview)
3. [Problem Statement](#problem-statement)
4. [Goals & Success Metrics](#goals--success-metrics)
5. [User Personas](#user-personas)
6. [Technical Architecture](#technical-architecture)
7. [Phase 1: Value Calculator](#phase-1-value-calculator)
8. [Phase 2: Implementation Specs & Filtering](#phase-2-implementation-specs--filtering)
9. [Phase 3: Validation & Lead Scoring](#phase-3-validation--lead-scoring)
10. [Phase 4: Live Integrations](#phase-4-live-integrations)
11. [Data Models](#data-models)
12. [UI/UX Specifications](#uiux-specifications)
13. [Component Architecture](#component-architecture)
14. [Implementation Notes](#implementation-notes)

---

## Project Status

**Last Updated:** January 15, 2026

### Current Phase: Phase 4 Complete ✅

All core phases are complete. The frontend is now fully integrated with the Phase 4 backend including authentication, data synchronization, monitoring dashboard, and settings management.

### Tech Stack (Implemented)

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | | |
| Build Tool | Vite | 7.3.1 |
| Frontend | React | 19.2.3 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.1.18 |
| State Management | Zustand | 5.0.10 |
| Drag & Drop | @dnd-kit | 6.3.1 / 10.0.0 |
| Charts | Recharts | 3.6.0 |
| Forms | React Hook Form | 7.71.1 |
| File Export | FileSaver.js | 2.0.5 |
| Routing | React Router DOM | 7.12.0 |
| **Backend (Phase 4)** | | |
| Runtime | Node.js | 22.x |
| Framework | Express | 5.1.0 |
| Database ORM | Prisma | 6.9.0 |
| Database | PostgreSQL | 16 |
| Job Queue | BullMQ | 5.34.0 |
| Caching/Queue | Redis | 7 |
| Auth | JWT | jsonwebtoken 9.0.2 |
| Validation | Zod | 3.25.28 |
| Logging | Pino | 9.6.0 |

### Implementation Progress

#### Phase 1: Value Calculator ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| **1.1 Funnel Builder** | ✅ Done | |
| - Display funnel steps | ✅ Done | Shows all 6 default steps |
| - Drag-to-reorder | ✅ Done | @dnd-kit/sortable implemented |
| - Inline editing | ✅ Done | Edit name, rate, volume |
| - Add/remove steps | ✅ Done | Min 2, max 10 steps enforced |
| **1.2 Business Metrics Input** | ✅ Done | |
| - Display metrics | ✅ Done | LTV, ratio, margin, target CAC |
| - Editable inputs | ✅ Done | Real-time recalculation |
| - Currency selector | ✅ Done | AUD, USD, GBP, EUR, NZD |
| **1.3 Audience Segmentation** | ✅ Done | |
| - Display segments | ✅ Done | Business/Consumer with multipliers |
| - Add/edit/remove | ✅ Done | Full CRUD with inline editing |
| **1.4 Value Calculation Engine** | ✅ Done | Full formula implemented |
| **1.5 Volume Analysis** | ✅ Done | Status badges (sufficient/borderline/insufficient) |
| **1.6 Results Display** | ✅ Done | Table with all segment values |
| **1.7 Scenario Modelling** | ✅ Done | Up to 3 scenarios side-by-side |
| **Export Options** | ✅ Done | |
| - CSV export | ✅ Done | |
| - JSON export | ✅ Done | |
| - Copy to clipboard | ✅ Done | |

#### Phase 2: Implementation Specs & Filtering ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| **2.1 Data Layer Schema Generator** | ✅ Done | |
| - Generate dataLayer.push() code | ✅ Done | Per-event JavaScript code |
| - Helper functions | ✅ Done | Hashing, segment detection |
| - Complete implementation file | ✅ Done | Download as .js |
| **2.2 GTM Tag Configuration Guide** | ✅ Done | |
| - Consent Mode v2 setup | ✅ Done | Step-by-step guide |
| - Data Layer Variables | ✅ Done | Variable configuration |
| - Custom Event Triggers | ✅ Done | Per funnel event |
| - Google Ads Tags | ✅ Done | Conversion tracking |
| - Meta Pixel Tags | ✅ Done | With event_id deduplication |
| - GA4 Event Tags | ✅ Done | With parameters |
| **2.3 Meta CAPI Payload Generator** | ✅ Done | |
| - JSON payloads | ✅ Done | Per conversion event |
| - cURL examples | ✅ Done | For testing |
| - Server implementation | ✅ Done | Node.js example code |
| - EMQ guidance | ✅ Done | Match quality optimization |
| **2.4 Google Offline Conversions** | ✅ Done | |
| - CSV template | ✅ Done | Pre-filled with values |
| - GCLID capture code | ✅ Done | JavaScript implementation |
| - Upload instructions | ✅ Done | Step-by-step guide |
| **2.5 Consumer Email Filter** | ✅ Done | |
| - Single email check | ✅ Done | Real-time validation |
| - Bulk email validation | ✅ Done | Paste & validate lists |
| - JavaScript function | ✅ Done | Embeddable validation code |
| - Form integration example | ✅ Done | HTML/JS sample |
| **2.6 Negative Keyword Generator** | ✅ Done | |
| - Category selection | ✅ Done | Free seekers, job seekers, students, etc. |
| - Email domain negatives | ✅ Done | 89+ consumer domains |
| - Export formats | ✅ Done | Plain, Google Ads Editor, Meta |
| **2.7 GA4 Quality Audiences** | ✅ Done | |
| - Engagement audiences | ✅ Done | High Intent, Engaged, Low Quality |
| - Funnel stage audiences | ✅ Done | Per-step remarketing |
| - JSON export | ✅ Done | For GA4 API |
| - Documentation | ✅ Done | Setup instructions |

#### Phase 3: Validation & Lead Scoring ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| **3.1 GTM Container Validator** | ✅ Done | |
| - JSON file upload | ✅ Done | Drag-and-drop or file picker |
| - Parse container structure | ✅ Done | Extract tags, triggers, variables |
| - Validation checks (8 types) | ✅ Done | Error/Warning/Info severity levels |
| - Match key detection | ✅ Done | Auto-detect available EMQ fields |
| - EMQ score estimate | ✅ Done | Based on detected match keys |
| - Recommendations | ✅ Done | Actionable improvement suggestions |
| **3.2 EMQ Score Estimator** | ✅ Done | |
| - Interactive match key toggles | ✅ Done | Visual checkbox interface |
| - Real-time score calculation | ✅ Done | Updates as keys are toggled |
| - Visual gauge display | ✅ Done | Circular progress with rating |
| - Improvement recommendations | ✅ Done | Prioritized by EMQ weight |
| **3.3 Lead Scoring Rule Builder** | ✅ Done | |
| - Three category tabs | ✅ Done | Firmographic/Behavioural/Engagement |
| - Drag-and-drop reordering | ✅ Done | @dnd-kit/sortable |
| - Add/edit/delete rules | ✅ Done | Full CRUD with inline form |
| - Toggle rules on/off | ✅ Done | Quick enable/disable |
| - Scoring preview | ✅ Done | Score-to-multiplier visualization |
| - Default rule templates | ✅ Done | 10 pre-built rules |
| **3.4 Scoring Implementation Export** | ✅ Done | |
| - GTM Custom JS Variable | ✅ Done | Complete scoring logic |
| - DataLayer integration code | ✅ Done | Push scoring results |
| - Setup guide | ✅ Done | Step-by-step instructions |

#### Phase 4: Live Integrations ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| **4.0 Backend Foundation** | ✅ Done | |
| - Monorepo setup (npm workspaces) | ✅ Done | `/backend` folder |
| - Express + TypeScript server | ✅ Done | Port 3001 |
| - Prisma ORM with PostgreSQL | ✅ Done | 14 tables defined |
| - Docker Compose (PostgreSQL + Redis) | ✅ Done | Dev environment |
| **4.0.1 Authentication** | ✅ Done | |
| - JWT auth (access + refresh tokens) | ✅ Done | 15min / 7d expiry |
| - API key auth for webhooks | ✅ Done | `sk_live_*` format |
| - Role-based access control | ✅ Done | ADMIN/MEMBER/VIEWER |
| - Organization invites | ✅ Done | Token-based invites |
| **4.0.2 Data APIs** | ✅ Done | |
| - Funnel CRUD | ✅ Done | `/api/v1/funnels` |
| - Business metrics CRUD | ✅ Done | `/api/v1/metrics` |
| - Segments CRUD | ✅ Done | `/api/v1/segments` |
| - Scoring rules CRUD | ✅ Done | `/api/v1/scoring-rules` |
| **4.0.3 Core Services** | ✅ Done | |
| - Scoring engine (ported from frontend) | ✅ Done | Same logic as Phase 3 |
| - Value calculation engine | ✅ Done | Same formula as Phase 1 |
| - PII hashing (SHA-256) | ✅ Done | Email, phone |
| - Credential encryption (AES-256-GCM) | ✅ Done | Integration secrets |
| **4.1 Lead Scoring Webhook** | ✅ Done | |
| - POST `/api/v1/score-lead` endpoint | ✅ Done | API key auth |
| - Real-time scoring | ✅ Done | <100ms target |
| - Lead + event storage | ✅ Done | PostgreSQL |
| - Rate limiting | ✅ Done | 500/min |
| **4.2 Monitoring APIs** | ✅ Done | |
| - Dashboard overview | ✅ Done | `/api/v1/monitoring/overview` |
| - Events by day/platform | ✅ Done | `/api/v1/monitoring/events` |
| - EMQ trend | ✅ Done | `/api/v1/monitoring/emq` |
| - Score distribution | ✅ Done | `/api/v1/monitoring/scores` |
| **4.3 Integration Management** | ✅ Done | |
| - Integration CRUD | ✅ Done | `/api/v1/integrations` |
| - Encrypted credential storage | ✅ Done | AES-256-GCM |
| - Sync logs | ✅ Done | Per-integration history |
| **4.4 Meta CAPI Integration** | ✅ Done | |
| - Meta CAPI client | ✅ Done | Graph API v18.0 |
| - Event sending from webhook | ✅ Done | BullMQ async |
| - Send status tracking | ✅ Done | Per-event status |
| **4.5 Google Ads Integration** | ✅ Done | |
| - Google Ads API client | ✅ Done | Offline conversions v15 |
| - BullMQ job queue | ✅ Done | Batch upload |
| - GCLID tracking | ✅ Done | Capture + upload |
| **4.6 Amplitude Integration** | 🔲 Deferred | |
| **4.7 Salesforce Integration** | 🔲 Deferred | |
| **4.8 Frontend Integration** | ✅ Done | |
| - API client layer | ✅ Done | JWT token refresh |
| - Auth store (Zustand) | ✅ Done | Separate auth state |
| - Login/Register pages | ✅ Done | `/login`, `/register`, `/invite/:token` |
| - Protected routes | ✅ Done | Auth guard wrapper |
| - Data sync hook | ✅ Done | Auto-sync with backend |
| - Toast notifications | ✅ Done | Error/success feedback |
| - Monitoring dashboard | ✅ Done | Recharts visualizations |
| - Settings page | ✅ Done | Profile, Org, API keys, Integrations, Team |

### Project Structure

```
signalstack/
├── src/                     # Frontend (React)
│   ├── components/
│   │   ├── common/          # Button, Input, Select, Card, Badge, Table, Tooltip, Toast, ErrorBoundary
│   │   ├── layout/          # Header, MainLayout
│   │   ├── auth/            # LoginForm, RegisterForm, ProtectedRoute, AuthLayout
│   │   ├── metrics/         # BusinessMetricsEditor
│   │   ├── funnel/          # FunnelBuilder, FunnelStep, DragHandle
│   │   ├── segments/        # SegmentList, SegmentCard
│   │   ├── results/         # ScenarioCompare, ScenarioPanel
│   │   ├── implementation/  # Phase 2 tools (CodeBlock, DataLayerGenerator, etc.)
│   │   ├── validation/      # Phase 3 tools (GTMValidator, EMQEstimator, ScoringRuleBuilder, etc.)
│   │   ├── monitoring/      # OverviewCards, EventsChart, EMQTrend, ScoreDistribution, etc.
│   │   └── settings/        # ProfileSettings, APIKeyManager, IntegrationManager, TeamMembers
│   ├── hooks/               # useCalculator, useFunnel, useScenarios, useDataSync, useMonitoring, usePermissions
│   ├── lib/
│   │   ├── api/             # API client, auth, funnels, metrics, segments, monitoring, mappers
│   │   ├── generators/      # Code generators (dataLayer, gtmConfig, metaCAPI, scoringTemplate)
│   │   ├── emqCalculator.ts # EMQ score calculation
│   │   ├── gtmValidator.ts  # GTM container parsing and validation
│   │   ├── scoringCalculations.ts # Lead scoring engine
│   │   └── ...              # calculations, constants, validation, export
│   ├── store/               # Zustand stores (useStore.ts, useAuthStore.ts)
│   ├── types/               # TypeScript interfaces (index.ts, api.ts)
│   ├── pages/               # Calculator, Implementation, Validation, Monitoring, Settings, Login, Register, Invite
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── backend/                 # Backend (Node.js/Express) - Phase 4
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── app.ts           # Express app configuration
│   │   ├── config/          # database.ts, redis.ts
│   │   ├── middleware/      # auth.ts, errorHandler.ts, rateLimit.ts
│   │   ├── routes/          # auth, funnel, metrics, lead, integration, monitoring
│   │   ├── services/        # scoring, calculation, hashing, auth
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # crypto, validation, logger
│   ├── prisma/
│   │   └── schema.prisma    # Database schema (14 tables)
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml       # PostgreSQL + Redis
├── package.json             # Root (npm workspaces)
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

### Commands

```bash
# Frontend
npm run dev           # Start frontend dev server (http://localhost:5173)
npm run build         # Production build

# Backend
npm run dev:backend   # Start backend dev server (http://localhost:3001)
npm run dev:all       # Start both frontend and backend
npm run db:migrate    # Run Prisma migrations
npm run db:generate   # Generate Prisma client
npm run db:studio     # Open Prisma Studio

# Docker (PostgreSQL + Redis)
docker compose up -d  # Start databases
docker compose down   # Stop databases
```

### Next Steps

1. **Production Deployment**
   - Deploy backend to cloud infrastructure
   - Configure production PostgreSQL and Redis
   - Set up CI/CD pipeline

2. **Future Enhancements** (Deferred)
   - Amplitude integration (analytics import)
   - Salesforce integration (CRM sync)
   - Clearbit integration (lead enrichment)

---

## Overview

SignalStack is a web application that helps B2B marketing teams implement value-based bidding correctly. It calculates conversion values based on funnel data and LTV, generates implementation specifications for ad platforms, validates existing setups, and filters consumer traffic.

### What It Does

1. **Calculates** the correct dollar value to assign each conversion event
2. **Analyses** conversion volumes against platform optimisation thresholds
3. **Generates** technical implementation specs (data layer, GTM, CAPI, offline conversions)
4. **Filters** consumer traffic through email validation and negative keywords
5. **Validates** existing GTM/pixel setups against best practices
6. **Scores** leads predictively to overcome attribution window limitations

### Build Approach

- **Phases 1-3:** Client-side React application, no backend required
- **Phase 4:** Add Node.js backend for API integrations
- **Storage:** LocalStorage for Phase 1-3, PostgreSQL for Phase 4

---

## Problem Statement

### The B2B Paid Media Challenge

B2B companies face structural disadvantages in paid advertising:

- **Consumer dilution:** Consumers click B2B ads, teaching algorithms to find more consumers
- **Volume gaps:** B2B conversion volumes often fall below platform optimisation thresholds
- **Attribution windows:** B2B sales cycles (6-12 months) exceed platform attribution (7-90 days)
- **Implementation complexity:** Value-based bidding sits awkwardly between marketing and engineering

### Platform Requirements

| Platform | Minimum Volume | Recommended Volume |
|----------|---------------|-------------------|
| Google Ads | 15 conversions/30 days | 50+ conversions/30 days |
| Meta | 50 events/week/ad set | 50+ events/week/ad set |

### Current State at pay.com.au

- GTM for tag management
- WordPress website, React funnel/application
- Salesforce Data Cloud, Amplitude for analytics
- Server-side tracking (CAPI) nascent
- Skill gap in team around proper implementation

---

## Goals & Success Metrics

### Primary Goals

1. Reduce consumer traffic waste by 50%+
2. Implement value-based bidding with correct values per event
3. Achieve 8.0+ Event Match Quality on lead events
4. Enable algorithm optimisation for revenue, not just lead volume

### Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| LTV:CAC Ratio | Unknown | 4:1 |
| Consumer email submissions | High | -50% |
| Event Match Quality | Unknown | 8.0+ |
| MQL→SQL conversion | ~25% | 35-45% |
| CAC payback period | Unknown | <12 months |

---

## User Personas

### Primary: Performance Marketer

**Name:** Sarah  
**Role:** Digital Marketing Manager  
**Goals:**
- Configure value-based bidding without engineering dependencies
- Understand which events to optimise toward
- Reduce consumer traffic waste

**Pain Points:**
- Doesn't know what values to assign conversion events
- Can't implement CAPI without developer help
- No visibility into whether current setup follows best practices

### Secondary: Marketing Operations

**Name:** James  
**Role:** Marketing Ops Specialist  
**Goals:**
- Generate implementation specs for engineering
- Validate GTM configurations
- Monitor signal quality over time

**Pain Points:**
- Handoff to engineering is slow and error-prone
- No centralised source of truth for event specifications
- Difficult to audit current implementation

---

## Technical Architecture

### Phase 1-3: Client-Side Only

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Funnel    │  │    Value    │  │  Spec Generator │  │
│  │  Builder    │  │ Calculator  │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Consumer   │  │     GTM     │  │  Lead Scoring   │  │
│  │  Filtering  │  │  Validator  │  │     Rules       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                          │                               │
│                   LocalStorage                           │
└─────────────────────────────────────────────────────────┘
```

### Phase 4: Full Stack

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
└────────────────────────────┬────────────────────────────┘
                             │
                      REST API / WebSocket
                             │
┌────────────────────────────┴────────────────────────────┐
│                    Node.js Backend                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Amplitude  │  │  Salesforce │  │   Ad Platform   │  │
│  │ Integration │  │ Integration │  │   Integrations  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Scoring   │  │    CAPI     │  │    Webhook      │  │
│  │   Engine    │  │   Sender    │  │    Receiver     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
                        PostgreSQL
```

### Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Hook Form for forms
- Recharts for visualisations
- FileSaver.js for exports

**Backend (Phase 4):**
- Node.js with Express
- PostgreSQL with Prisma ORM
- Bull for job queues
- JWT authentication

---

## Phase 1: Value Calculator

**Timeline:** Week 1-2  
**Complexity:** Low  
**Backend Required:** No

### Features

#### 1.1 Funnel Builder

Users define their conversion funnel with steps, conversion rates, and volumes.

**User Story:**  
As a marketer, I want to define my conversion funnel so that the tool can calculate appropriate values for each step.

**Inputs:**
- Step name (text)
- Step order (auto-assigned, drag-to-reorder)
- Conversion rate to next step (percentage, 0-100)
- Monthly conversion volume (number)
- Is this step trackable in ad platforms? (boolean)

**Default Funnel Template:**
```
1. Website Visit → Email Captured (8%)
2. Email Captured → Application Started (25%)
3. Application Started → Signup Complete (60%)
4. Signup Complete → First Transaction (40%)
5. First Transaction → Activated (10 txns) (50%)
```

**Validation Rules:**
- Minimum 2 steps
- Maximum 10 steps
- Conversion rates must be 0.1% - 100%
- Volumes must be positive integers

#### 1.2 Business Metrics Input

**Inputs:**
- Average Customer LTV (currency, required)
- Target LTV:CAC Ratio (number, default: 4)
- Gross Margin % (optional, default: 100%)

**Derived Calculations:**
```
Target CAC = LTV / LTV:CAC Ratio
Adjusted CAC = Target CAC × (Margin / 100)
```

#### 1.3 Audience Segmentation

Users can define audience segments with different conversion rate multipliers.

**Inputs per Segment:**
- Segment name (text)
- Conversion rate multiplier (number, e.g., 1.5 = 150% of baseline)
- Identification rule (dropdown: email domain, form field, behaviour)

**Default Segments:**
```
1. Business Email (multiplier: 1.5)
2. Consumer Email (multiplier: 0.1)
```

#### 1.4 Value Calculation Engine

**Core Formula:**
```
Event Value = Target CAC × Cumulative Conversion Probability

Where:
Cumulative Probability = Product of all downstream conversion rates
```

**Example Calculation:**
```
LTV = $5,700
LTV:CAC Target = 4:1
Target CAC = $1,425

Email Captured Value:
  = $1,425 × (25% × 60% × 40% × 50%)
  = $1,425 × 3%
  = $42.75

With Business Email Multiplier (1.5×):
  = $42.75 × 1.5
  = $64.13

With Consumer Email Multiplier (0.1×):
  = $42.75 × 0.1
  = $4.28
```

#### 1.5 Volume Analysis

Compare volumes against platform thresholds.

**Thresholds:**
```javascript
const THRESHOLDS = {
  google: {
    minimum: 15,      // per 30 days
    recommended: 50   // per 30 days
  },
  meta: {
    minimum: 200,     // per 30 days (50/week × 4)
    recommended: 200  // per 30 days
  }
};
```

**Output per Event:**
- Volume status: "Sufficient", "Borderline", "Insufficient"
- Recommendation: "Optimise toward this event" or "Use as measurement only"
- Suggested proxy event if volume insufficient

#### 1.6 Results Display

**Output Table Columns:**
1. Funnel Step
2. Conversion Rate
3. Monthly Volume
4. Volume Status (with colour coding)
5. Cumulative Probability
6. Base Value
7. Business Segment Value
8. Consumer Segment Value
9. Recommendation

**Export Options:**
- CSV download
- Copy to clipboard (formatted for spreadsheets)
- JSON export (for programmatic use)

#### 1.7 Scenario Modelling

Allow users to compare scenarios:
- "What if we improve conversion rate at step X?"
- "What if we increase LTV:CAC target to 5:1?"
- "At what conversion rate does consumer traffic become worth bidding on?"

**UI:** Side-by-side comparison of up to 3 scenarios

### Phase 1 UI Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  SignalStack                                    [Save] [Export]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Business Metrics                                         │  │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │ │ LTV         │ │ LTV:CAC     │ │ Gross Margin        │ │  │
│  │ │ $5,700      │ │ 4:1         │ │ 100%                │ │  │
│  │ └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  │                              Target CAC: $1,425          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Conversion Funnel                           [+ Add Step] │  │
│  │ ┌───────────────────────────────────────────────────────┐│  │
│  │ │ ≡ │ Website Visit      │ → │ 8%   │ Vol: 10,000 │ 🟢 ││  │
│  │ ├───────────────────────────────────────────────────────┤│  │
│  │ │ ≡ │ Email Captured     │ → │ 25%  │ Vol: 800    │ 🟢 ││  │
│  │ ├───────────────────────────────────────────────────────┤│  │
│  │ │ ≡ │ Application Start  │ → │ 60%  │ Vol: 200    │ 🟡 ││  │
│  │ ├───────────────────────────────────────────────────────┤│  │
│  │ │ ≡ │ Signup Complete    │ → │ 40%  │ Vol: 120    │ 🟡 ││  │
│  │ ├───────────────────────────────────────────────────────┤│  │
│  │ │ ≡ │ First Transaction  │ → │ 50%  │ Vol: 48     │ 🔴 ││  │
│  │ ├───────────────────────────────────────────────────────┤│  │
│  │ │ ≡ │ Activated (10 txn) │    │      │ Vol: 24     │ 🔴 ││  │
│  │ └───────────────────────────────────────────────────────┘│  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Audience Segments                                        │  │
│  │ ┌────────────────┬────────────┬────────────────────────┐│  │
│  │ │ Business Email │ 1.5×       │ Domain not in blocklist││  │
│  │ ├────────────────┼────────────┼────────────────────────┤│  │
│  │ │ Consumer Email │ 0.1×       │ Domain in blocklist    ││  │
│  │ └────────────────┴────────────┴────────────────────────┘│  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Calculated Values                                        │  │
│  │ ┌──────────────┬────────┬────────┬─────────┬──────────┐ │  │
│  │ │ Event        │ Volume │ Status │ Base $  │ Biz $    │ │  │
│  │ ├──────────────┼────────┼────────┼─────────┼──────────┤ │  │
│  │ │ Email Capture│ 800    │ 🟢 OK  │ $42.75  │ $64.13   │ │  │
│  │ │ App Start    │ 200    │ 🟡 Low │ $171.00 │ $256.50  │ │  │
│  │ │ Signup       │ 120    │ 🟡 Low │ $285.00 │ $427.50  │ │  │
│  │ │ 1st Txn      │ 48     │ 🔴 !!  │ $712.50 │ $1068.75 │ │  │
│  │ │ Activated    │ 24     │ 🔴 !!  │ $1425   │ $2137.50 │ │  │
│  │ └──────────────┴────────┴────────┴─────────┴──────────┘ │  │
│  │                                                          │  │
│  │ ⚠️ Recommendation: Optimise toward "Email Capture" or   │  │
│  │    "Application Start". Deeper events lack volume.       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Implementation Specs & Filtering

**Timeline:** Week 3-4  
**Complexity:** Medium  
**Backend Required:** No

### Features

#### 2.1 Data Layer Schema Generator

Generate the exact data layer structure developers need.

**Output Format:**
```javascript
// Event: email_captured
window.dataLayer.push({
  event: 'email_captured',
  event_id: '{{unique_event_id}}',  // For deduplication
  user_data: {
    email: '{{hashed_email}}',      // SHA-256, lowercase, trimmed
    phone: '{{hashed_phone}}',      // SHA-256, E.164 format
  },
  event_value: {
    value: 64.13,                   // Business email value
    currency: 'AUD'
  },
  user_properties: {
    email_type: 'business',         // or 'consumer'
    lead_score: 85                  // Phase 3
  }
});
```

**Per Event, Generate:**
1. Event name (snake_case)
2. Required parameters
3. Optional parameters for enhanced matching
4. Value assignment logic
5. Segment determination logic

#### 2.2 GTM Tag Configuration Guide

For each event, generate step-by-step GTM setup:

**Output Structure:**
```markdown
## Event: email_captured

### 1. Data Layer Variable Setup
Create the following Data Layer Variables:
- dlv_event_id: Data Layer Variable → event_id
- dlv_email_hashed: Data Layer Variable → user_data.email
- dlv_event_value: Data Layer Variable → event_value.value
- dlv_email_type: Data Layer Variable → user_properties.email_type

### 2. Trigger Setup
- Trigger Type: Custom Event
- Event Name: email_captured
- Fires On: All Custom Events

### 3. Meta Pixel Tag
- Tag Type: Meta Pixel
- Event Name: Lead
- Parameters:
  - value: {{dlv_event_value}}
  - currency: AUD
  - content_name: email_captured
  - event_id: {{dlv_event_id}}

### 4. Google Ads Conversion Tag
- Tag Type: Google Ads Conversion Tracking
- Conversion ID: [YOUR_ID]
- Conversion Label: [YOUR_LABEL]
- Conversion Value: {{dlv_event_value}}
- Currency Code: AUD
- Order ID: {{dlv_event_id}}

### 5. GA4 Event Tag
- Tag Type: GA4 Event
- Event Name: generate_lead
- Parameters:
  - value: {{dlv_event_value}}
  - currency: AUD
```

#### 2.3 Meta CAPI Payload Generator

Generate server-side event payloads with EMQ optimisation guidance.

**Output:**
```javascript
// Meta Conversions API Payload
{
  "data": [{
    "event_name": "Lead",
    "event_time": {{unix_timestamp}},
    "event_id": "{{event_id}}",  // Must match Pixel for dedup
    "event_source_url": "{{page_url}}",
    "action_source": "website",
    "user_data": {
      // HIGH PRIORITY (send all available)
      "em": ["{{sha256_email}}"],           // Hashed email
      "ph": ["{{sha256_phone}}"],           // Hashed phone, E.164
      "fbc": "{{facebook_click_id}}",       // From _fbc cookie
      "fbp": "{{facebook_browser_id}}",     // From _fbp cookie
      
      // MEDIUM PRIORITY
      "external_id": ["{{sha256_user_id}}"], // Your user ID
      "client_ip_address": "{{ip}}",
      "client_user_agent": "{{user_agent}}",
      
      // INCREMENTAL (if available)
      "ct": ["{{sha256_city}}"],
      "st": ["{{sha256_state}}"],
      "zp": ["{{sha256_zip}}"],
      "country": ["{{sha256_country}}"]
    },
    "custom_data": {
      "value": 64.13,
      "currency": "AUD",
      "content_name": "email_captured",
      "lead_type": "business"
    }
  }]
}

// EMQ Target: 8.0+
// Current estimated EMQ with above fields: 8.5
// Key improvement: Capture fbc cookie from landing page URL parameter
```

**Data Normalisation Rules (included in output):**
```
Email: lowercase, trim whitespace, then SHA-256
Phone: E.164 format (e.g., +61412345678), then SHA-256
Names: lowercase, remove punctuation, then SHA-256
City/State: lowercase, no punctuation, then SHA-256
```

#### 2.4 Google Ads Offline Conversion Template

Generate CSV template and upload instructions.

**CSV Template:**
```csv
Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
{{gclid}},signup_complete,2026-01-14 10:30:00+11:00,285.00,AUD
```

**Instructions:**
1. GCLID capture requirements
2. Time format specifications
3. Upload frequency recommendations (daily)
4. Enhanced Conversions setup (with hashed email)

#### 2.5 Consumer Email Filtering

Generate email domain blocklist and implementation code.

**Blocklist Categories:**

```javascript
const CONSUMER_DOMAINS = {
  global: [
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.co.uk', 'yahoo.com.au',
    'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com',
    'aol.com',
    'protonmail.com', 'proton.me',
    'zoho.com',
    'mail.com', 'email.com',
    'gmx.com', 'gmx.net'
  ],
  australia: [
    'bigpond.com', 'bigpond.net.au',
    'optusnet.com.au',
    'ozemail.com.au',
    'tpg.com.au',
    'internode.on.net',
    'dodo.com.au'
  ],
  regional: [
    'qq.com', '163.com', '126.com',     // China
    'mail.ru', 'yandex.ru',              // Russia
    'naver.com', 'daum.net',             // Korea
    'web.de', 'gmx.de',                  // Germany
    'orange.fr', 'free.fr',              // France
    'libero.it', 'virgilio.it'           // Italy
  ]
};
```

**Implementation Code:**
```javascript
// JavaScript validation function
function isConsumerEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true; // Invalid email = treat as consumer
  
  const allConsumerDomains = [
    ...CONSUMER_DOMAINS.global,
    ...CONSUMER_DOMAINS.australia,
    ...CONSUMER_DOMAINS.regional
  ];
  
  return allConsumerDomains.includes(domain);
}

// Usage in data layer
const emailType = isConsumerEmail(email) ? 'consumer' : 'business';
const eventValue = emailType === 'business' ? 64.13 : 4.28;
```

**HTML Form Validation (optional hard block):**
```html
<input 
  type="email" 
  pattern="^[^@]+@(?!(gmail|yahoo|hotmail|outlook)\.).*$"
  title="Please use your business email address"
/>
```

#### 2.6 Negative Keyword Generator

Generate negative keyword lists based on industry.

**Base Negative Keywords (all B2B):**
```
// Consumer Intent
free
cheap
discount
coupon
diy
personal
home
individual

// Job Seekers
jobs
careers
hiring
salary
resume
interview
training
certification
course
learn

// Students
student
university
college
assignment
homework
thesis

// Information Seekers (not buyers)
what is
how to
definition
example
template free
download free
```

**Industry-Specific Additions:**
```javascript
const INDUSTRY_NEGATIVES = {
  payments: [
    'personal payments',
    'send money to friend',
    'venmo',
    'paypal personal',
    'split bill'
  ],
  saas: [
    'free trial forever',
    'open source alternative',
    'free version'
  ],
  // Add more industries
};
```

**Output Formats:**
- Plain text (one per line)
- Google Ads Editor format
- Meta Ads Manager format

#### 2.7 GA4 Quality Audience Definitions

Generate audience configurations for quality-based retargeting.

**High-Intent Audience:**
```javascript
// GA4 Audience Definition
{
  name: "High Intent Visitors",
  description: "Visitors showing strong purchase intent signals",
  conditions: {
    include: [
      { metric: "session_duration", operator: ">=", value: 60 },
      { metric: "scroll_depth", operator: ">=", value: 50 },
      { dimension: "page_path", operator: "contains", value: "/pricing" }
    ],
    operator: "AND"
  },
  membership_duration_days: 30
}
```

**Audiences to Create:**
1. High Intent (60s+ session, 50%+ scroll, pricing page)
2. Engaged Visitors (30s+ session, 2+ pages)
3. Bottom Funnel (demo/signup page visitors)
4. Low Quality Exclude (bounced, <10s session)

---

## Phase 3: Validation & Lead Scoring

**Timeline:** Week 5-6  
**Complexity:** Medium  
**Backend Required:** No

### Features

#### 3.1 GTM Container Validator

Upload GTM container export (JSON) and validate against best practices.

**Validation Checks:**

| Check | Severity | Description |
|-------|----------|-------------|
| All funnel events exist | Error | Each defined funnel step has a corresponding tag |
| Events have values | Warning | Conversion tags include value parameters |
| Event IDs for dedup | Error | Meta Pixel and CAPI tags share event_id |
| Match keys captured | Warning | User data (email, phone) being collected |
| Data is hashed | Error | PII is SHA-256 hashed before sending |
| Consent Mode enabled | Warning | Google Consent Mode v2 configured |
| CAPI tags present | Info | Server-side tags configured |
| Trigger specificity | Warning | Triggers are specific, not firing on all pages |

**Parser Logic:**
```javascript
function parseGTMContainer(json) {
  const container = JSON.parse(json);
  
  return {
    tags: container.containerVersion.tag || [],
    triggers: container.containerVersion.trigger || [],
    variables: container.containerVersion.variable || [],
    // Extract relevant configurations
  };
}

function validateContainer(parsed, funnelEvents) {
  const results = [];
  
  // Check 1: All funnel events exist
  for (const event of funnelEvents) {
    const hasTag = parsed.tags.some(t => 
      t.parameter?.some(p => p.value === event.name)
    );
    if (!hasTag) {
      results.push({
        check: 'funnel_event_exists',
        severity: 'error',
        event: event.name,
        message: `No tag found for funnel event: ${event.name}`
      });
    }
  }
  
  // Additional checks...
  return results;
}
```

**Output Report:**
```
┌────────────────────────────────────────────────────────────┐
│ GTM Validation Report                                      │
├────────────────────────────────────────────────────────────┤
│ ❌ ERRORS (3)                                              │
│   • Missing tag for event: first_transaction               │
│   • Meta Pixel tag missing event_id for deduplication      │
│   • Email being sent unhashed in signup_complete tag       │
│                                                            │
│ ⚠️ WARNINGS (2)                                            │
│   • No value parameter in email_captured tag               │
│   • Consent Mode not detected                              │
│                                                            │
│ ℹ️ INFO (1)                                                │
│   • No CAPI tags detected - consider server-side tracking  │
│                                                            │
│ Estimated EMQ: 6.2 (Target: 8.0+)                          │
│ Missing for higher EMQ: fbc cookie, phone number           │
└────────────────────────────────────────────────────────────┘
```

#### 3.2 EMQ Score Estimator

Estimate Event Match Quality based on available match keys.

**EMQ Scoring Model:**
```javascript
const EMQ_WEIGHTS = {
  email: 2.5,
  fbc: 2.0,
  phone: 1.5,
  fbp: 1.0,
  external_id: 0.8,
  ip_address: 0.5,
  user_agent: 0.5,
  city: 0.3,
  state: 0.3,
  zip: 0.3,
  country: 0.2
};

const BASE_EMQ = 3.0; // Minimum with just event data
const MAX_EMQ = 9.3;  // Practical maximum

function estimateEMQ(availableFields) {
  let score = BASE_EMQ;
  
  for (const field of availableFields) {
    score += EMQ_WEIGHTS[field] || 0;
  }
  
  return Math.min(score, MAX_EMQ);
}
```

#### 3.3 Lead Scoring Rule Builder

Configure predictive lead scoring rules.

**Rule Categories:**

**Firmographic Signals:**
```javascript
{
  category: 'firmographic',
  rules: [
    { field: 'email_domain', condition: 'is_business', points: 20 },
    { field: 'email_domain', condition: 'is_consumer', points: -50 },
    { field: 'company_size', condition: '> 50', points: 15 },
    { field: 'industry', condition: 'in_target_list', points: 10 }
  ]
}
```

**Behavioural Signals:**
```javascript
{
  category: 'behavioural',
  rules: [
    { field: 'page_path', condition: 'contains_pricing', points: 25 },
    { field: 'page_path', condition: 'contains_demo', points: 30 },
    { field: 'page_path', condition: 'contains_case_study', points: 15 },
    { field: 'session_count', condition: '> 1', points: 20 },
    { field: 'session_duration', condition: '> 120', points: 10 },
    { field: 'scroll_depth', condition: '> 75', points: 5 }
  ]
}
```

**Engagement Signals:**
```javascript
{
  category: 'engagement',
  rules: [
    { field: 'form_type', condition: 'demo_request', points: 40 },
    { field: 'form_type', condition: 'newsletter', points: 5 },
    { field: 'content_download', condition: 'bottom_funnel', points: 25 },
    { field: 'content_download', condition: 'top_funnel', points: 10 }
  ]
}
```

**Score to Value Mapping:**
```javascript
function scoreToValue(score, baseValue) {
  // Linear scaling from 0-100 score to 0.1x-2x multiplier
  const minMultiplier = 0.1;
  const maxMultiplier = 2.0;
  
  const normalizedScore = Math.max(0, Math.min(100, score)) / 100;
  const multiplier = minMultiplier + (normalizedScore * (maxMultiplier - minMultiplier));
  
  return baseValue * multiplier;
}
```

#### 3.4 Scoring Implementation Export

Generate implementation code for lead scoring.

**Client-Side Scoring (GTM Custom JavaScript):**
```javascript
function() {
  var score = 0;
  var signals = {};
  
  // Check email type
  var email = {{dlv_email}};
  if (email && !isConsumerEmail(email)) {
    score += 20;
    signals.email_type = 'business';
  } else {
    score -= 50;
    signals.email_type = 'consumer';
  }
  
  // Check page path
  var path = {{Page Path}};
  if (path.includes('/pricing')) {
    score += 25;
    signals.viewed_pricing = true;
  }
  
  // Check session count
  var sessionCount = {{Session Count}};
  if (sessionCount > 1) {
    score += 20;
    signals.return_visitor = true;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    signals: signals
  };
}
```

---

## Phase 4: Live Integrations

**Timeline:** Week 7+  
**Complexity:** High  
**Backend Required:** Yes

### Features

#### 4.1 Amplitude Integration

Pull conversion rates and volumes automatically.

**API Endpoints Used:**
- Segmentation API: Get funnel metrics
- Dashboard REST API: Get saved charts/metrics

**Data to Pull:**
```javascript
{
  events: [
    { name: 'email_captured', count_30d: 800, count_7d: 185 },
    { name: 'application_started', count_30d: 200, count_7d: 48 },
    // ...
  ],
  funnels: [
    {
      steps: ['email_captured', 'application_started'],
      conversion_rate: 0.25,
      median_time: '2h 15m'
    }
  ]
}
```

**Sync Frequency:** Daily at 6am UTC

#### 4.2 Salesforce Integration

Pull LTV data, segment information, and historical patterns.

**Objects to Query:**
- Opportunity (for closed-won revenue)
- Account (for segmentation)
- Lead (for conversion patterns)

**SOQL Queries:**
```sql
-- Average LTV by segment
SELECT Account.Industry, AVG(Amount) avgLTV, COUNT(Id) customerCount
FROM Opportunity
WHERE StageName = 'Closed Won'
AND CloseDate >= LAST_N_MONTHS:12
GROUP BY Account.Industry

-- Conversion rates by lead source
SELECT LeadSource, 
       COUNT(Id) total,
       SUM(CASE WHEN IsConverted THEN 1 ELSE 0 END) converted
FROM Lead
WHERE CreatedDate >= LAST_N_MONTHS:6
GROUP BY LeadSource
```

**Sync Frequency:** Daily at 7am UTC

#### 4.3 Real-Time Lead Scoring Webhook

Receive lead data, score in real-time, send to CAPI.

**Webhook Endpoint:**
```
POST /api/v1/score-lead
Content-Type: application/json

{
  "email": "john@company.com",
  "phone": "+61412345678",
  "page_path": "/pricing",
  "utm_source": "google",
  "utm_campaign": "brand",
  "session_duration": 145,
  "pages_viewed": 4,
  "form_type": "demo_request",
  "timestamp": "2026-01-14T10:30:00Z",
  "fbc": "fb.1.1234567890.987654321",
  "fbp": "fb.1.1234567890.123456789",
  "ip_address": "203.45.67.89",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "score": 85,
  "value": 108.57,
  "segment": "business",
  "signals": {
    "email_type": "business",
    "viewed_pricing": true,
    "return_visitor": true,
    "demo_request": true
  },
  "capi_sent": {
    "meta": true,
    "google": true
  }
}
```

**Processing Flow:**
1. Receive webhook (< 100ms response target)
2. Enrich with Clearbit data if configured
3. Calculate score based on rules
4. Convert score to value
5. Hash PII fields
6. Send to Meta CAPI
7. Queue for Google Ads offline conversion upload
8. Store for analytics

#### 4.4 Meta CAPI Direct Integration

Send events directly to Meta Conversions API.

**Implementation:**
```javascript
async function sendToMetaCAPI(event) {
  const payload = {
    data: [{
      event_name: event.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.event_id,
      event_source_url: event.url,
      action_source: 'website',
      user_data: hashUserData(event.user_data),
      custom_data: {
        value: event.value,
        currency: 'AUD'
      }
    }],
    access_token: process.env.META_ACCESS_TOKEN
  };
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  
  return response.json();
}
```

#### 4.5 Google Ads Offline Conversion Upload

Batch upload conversions daily.

**Implementation:**
```javascript
async function uploadGoogleConversions() {
  const conversions = await db.pendingConversions.findMany({
    where: { 
      uploaded_at: null,
      platform: 'google'
    }
  });
  
  const conversionActions = conversions.map(c => ({
    gclid: c.gclid,
    conversionAction: `customers/${CUSTOMER_ID}/conversionActions/${ACTION_ID}`,
    conversionDateTime: formatDateTime(c.created_at),
    conversionValue: c.value,
    currencyCode: 'AUD'
  }));
  
  // Use Google Ads API to upload
  const result = await googleAdsClient.uploadClickConversions({
    customerId: CUSTOMER_ID,
    conversions: conversionActions,
    partialFailure: true
  });
  
  // Mark as uploaded
  await db.pendingConversions.updateMany({
    where: { id: { in: conversions.map(c => c.id) } },
    data: { uploaded_at: new Date() }
  });
}
```

**Schedule:** Daily at 8am UTC

#### 4.6 Monitoring Dashboard

Track signal health over time.

**Metrics to Display:**
- Events sent per day (by platform)
- EMQ trend (7-day moving average)
- Match rate by platform
- Lead scores distribution
- Value distribution by segment
- Conversion rate trends vs baseline
- Alert status

**Alerts:**
```javascript
const ALERT_RULES = [
  {
    metric: 'emq_score',
    condition: 'drops_below',
    threshold: 7.0,
    window: '24h',
    severity: 'warning'
  },
  {
    metric: 'event_volume',
    condition: 'drops_by_percent',
    threshold: 30,
    window: '24h',
    severity: 'critical'
  },
  {
    metric: 'conversion_rate',
    condition: 'changes_by_percent',
    threshold: 20,
    window: '7d',
    severity: 'info'
  }
];
```

---

## Data Models

### Phase 1-3 (LocalStorage)

```typescript
interface FunnelStep {
  id: string;
  name: string;
  order: number;
  conversionRate: number;      // 0-100
  monthlyVolume: number;
  isTrackable: boolean;
  eventName?: string;          // snake_case for implementation
}

interface BusinessMetrics {
  ltv: number;
  ltvCacRatio: number;
  grossMargin: number;         // 0-100
  currency: string;
}

interface AudienceSegment {
  id: string;
  name: string;
  multiplier: number;          // e.g., 1.5 = 150%
  identificationRule: {
    type: 'email_domain' | 'form_field' | 'behaviour';
    condition: string;
  };
}

interface CalculatedValue {
  stepId: string;
  stepName: string;
  cumulativeProbability: number;
  baseValue: number;
  segmentValues: Record<string, number>;  // segmentId -> value
  volumeStatus: 'sufficient' | 'borderline' | 'insufficient';
  recommendation: string;
}

interface ScoringRule {
  id: string;
  category: 'firmographic' | 'behavioural' | 'engagement';
  field: string;
  condition: string;
  points: number;
  enabled: boolean;
}

interface StoredState {
  version: number;
  funnel: FunnelStep[];
  metrics: BusinessMetrics;
  segments: AudienceSegment[];
  scoringRules: ScoringRule[];
  lastUpdated: string;
}
```

### Phase 4 (PostgreSQL)

```sql
-- Core tables
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  steps JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  ltv DECIMAL(12,2) NOT NULL,
  ltv_cac_ratio DECIMAL(5,2) NOT NULL,
  gross_margin DECIMAL(5,2) DEFAULT 100,
  currency VARCHAR(3) DEFAULT 'AUD',
  effective_from DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email_hash VARCHAR(64),  -- SHA-256
  phone_hash VARCHAR(64),
  score INTEGER,
  value DECIMAL(12,2),
  segment VARCHAR(50),
  signals JSONB,
  raw_data JSONB,  -- Encrypted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  event_name VARCHAR(100) NOT NULL,
  event_id VARCHAR(100),  -- For deduplication
  value DECIMAL(12,2),
  gclid VARCHAR(255),
  fbc VARCHAR(255),
  meta_sent_at TIMESTAMP,
  google_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signal_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  date DATE NOT NULL,
  platform VARCHAR(20) NOT NULL,  -- meta, google
  events_sent INTEGER DEFAULT 0,
  events_matched INTEGER DEFAULT 0,
  avg_emq DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_leads_org_created ON leads(organization_id, created_at);
CREATE INDEX idx_events_lead ON conversion_events(lead_id);
CREATE INDEX idx_metrics_org_date ON signal_metrics(organization_id, date);
```

---

## UI/UX Specifications

### Design System

**Colors:**
```css
:root {
  /* Primary */
  --primary-600: #4F46E5;  /* Indigo */
  --primary-500: #6366F1;
  --primary-100: #E0E7FF;
  
  /* Status */
  --success: #10B981;       /* Green */
  --warning: #F59E0B;       /* Amber */
  --error: #EF4444;         /* Red */
  --info: #3B82F6;          /* Blue */
  
  /* Neutral */
  --gray-900: #111827;
  --gray-700: #374151;
  --gray-500: #6B7280;
  --gray-300: #D1D5DB;
  --gray-100: #F3F4F6;
  --gray-50: #F9FAFB;
}
```

**Typography:**
```css
/* Headings */
font-family: 'Inter', system-ui, sans-serif;
h1: 30px / 36px, font-weight: 600;
h2: 24px / 32px, font-weight: 600;
h3: 18px / 28px, font-weight: 600;

/* Body */
body: 14px / 20px, font-weight: 400;
small: 12px / 16px, font-weight: 400;
```

**Spacing:**
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Component Patterns

**Cards:**
```jsx
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Card Title
  </h3>
  {/* Content */}
</div>
```

**Status Badges:**
```jsx
// Volume status indicators
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Sufficient
</span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  Borderline
</span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Insufficient
</span>
```

**Data Tables:**
```jsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Column
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        Value
      </td>
    </tr>
  </tbody>
</table>
```

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Navigation Structure

```
SignalStack
├── Calculator (Phase 1)
│   ├── Funnel Builder
│   ├── Business Metrics
│   ├── Segments
│   └── Results
├── Implementation (Phase 2)
│   ├── Data Layer Specs
│   ├── GTM Guide
│   ├── CAPI Payloads
│   └── Consumer Filtering
├── Validation (Phase 3)
│   ├── GTM Validator
│   ├── Lead Scoring Rules
│   └── Scoring Export
└── Monitoring (Phase 4)
    ├── Dashboard
    ├── Alerts
    └── Settings
```

---

## Component Architecture

### Phase 1 Components

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   └── Tooltip.tsx
│   ├── funnel/
│   │   ├── FunnelBuilder.tsx
│   │   ├── FunnelStep.tsx
│   │   ├── StepEditor.tsx
│   │   └── DragHandle.tsx
│   ├── metrics/
│   │   ├── BusinessMetrics.tsx
│   │   ├── MetricInput.tsx
│   │   └── DerivedValues.tsx
│   ├── segments/
│   │   ├── SegmentList.tsx
│   │   ├── SegmentEditor.tsx
│   │   └── SegmentRule.tsx
│   └── results/
│       ├── ValueTable.tsx
│       ├── VolumeIndicator.tsx
│       ├── Recommendations.tsx
│       ├── ScenarioCompare.tsx
│       └── ExportButtons.tsx
├── hooks/
│   ├── useCalculator.ts
│   ├── useLocalStorage.ts
│   └── useFunnel.ts
├── lib/
│   ├── calculations.ts
│   ├── validation.ts
│   ├── export.ts
│   └── constants.ts
├── store/
│   └── useStore.ts
└── pages/
    └── Calculator.tsx
```

### Key Component Specs

**FunnelBuilder.tsx**
```typescript
interface FunnelBuilderProps {
  steps: FunnelStep[];
  onStepsChange: (steps: FunnelStep[]) => void;
}

// Features:
// - Drag-and-drop reordering (use @dnd-kit/core)
// - Inline editing of step properties
// - Add/remove steps
// - Visual funnel representation
```

**ValueTable.tsx**
```typescript
interface ValueTableProps {
  steps: FunnelStep[];
  calculatedValues: CalculatedValue[];
  segments: AudienceSegment[];
}

// Features:
// - Sortable columns
// - Export to CSV/JSON
// - Copy individual values
// - Colour-coded volume status
```

**BusinessMetrics.tsx**
```typescript
interface BusinessMetricsProps {
  metrics: BusinessMetrics;
  onChange: (metrics: BusinessMetrics) => void;
}

// Features:
// - Currency selector (AUD, USD, etc.)
// - Real-time derived value calculation
// - Input validation
// - Help tooltips
```

---

## Implementation Notes

### Calculation Engine

```typescript
// lib/calculations.ts

export function calculateFunnelValues(
  steps: FunnelStep[],
  metrics: BusinessMetrics,
  segments: AudienceSegment[]
): CalculatedValue[] {
  const targetCAC = metrics.ltv / metrics.ltvCacRatio;
  const adjustedCAC = targetCAC * (metrics.grossMargin / 100);
  
  // Sort steps by order
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  
  // Calculate cumulative probabilities from bottom up
  const cumulativeProbs: number[] = [];
  let cumProb = 1;
  
  for (let i = sortedSteps.length - 1; i >= 0; i--) {
    cumulativeProbs.unshift(cumProb);
    cumProb *= sortedSteps[i].conversionRate / 100;
  }
  
  // Calculate values
  return sortedSteps.map((step, i) => {
    const baseValue = adjustedCAC * cumulativeProbs[i];
    
    const segmentValues: Record<string, number> = {};
    for (const segment of segments) {
      segmentValues[segment.id] = baseValue * segment.multiplier;
    }
    
    const volumeStatus = getVolumeStatus(step.monthlyVolume);
    
    return {
      stepId: step.id,
      stepName: step.name,
      cumulativeProbability: cumulativeProbs[i],
      baseValue,
      segmentValues,
      volumeStatus,
      recommendation: getRecommendation(volumeStatus, i, sortedSteps.length)
    };
  });
}

function getVolumeStatus(volume: number): 'sufficient' | 'borderline' | 'insufficient' {
  if (volume >= 50) return 'sufficient';
  if (volume >= 15) return 'borderline';
  return 'insufficient';
}

function getRecommendation(
  status: string,
  stepIndex: number,
  totalSteps: number
): string {
  if (status === 'sufficient') {
    return 'Optimise toward this event';
  }
  if (status === 'borderline') {
    return 'Usable for optimisation with caution';
  }
  if (stepIndex < totalSteps - 1) {
    return 'Use as measurement only. Optimise toward higher-volume events.';
  }
  return 'Volume too low for optimisation';
}
```

### State Management

```typescript
// store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  funnel: FunnelStep[];
  metrics: BusinessMetrics;
  segments: AudienceSegment[];
  scoringRules: ScoringRule[];
  
  // Actions
  setFunnel: (funnel: FunnelStep[]) => void;
  updateStep: (id: string, updates: Partial<FunnelStep>) => void;
  addStep: (step: FunnelStep) => void;
  removeStep: (id: string) => void;
  reorderSteps: (startIndex: number, endIndex: number) => void;
  
  setMetrics: (metrics: BusinessMetrics) => void;
  
  setSegments: (segments: AudienceSegment[]) => void;
  addSegment: (segment: AudienceSegment) => void;
  updateSegment: (id: string, updates: Partial<AudienceSegment>) => void;
  removeSegment: (id: string) => void;
  
  setScoringRules: (rules: ScoringRule[]) => void;
  
  reset: () => void;
}

const DEFAULT_STATE = {
  funnel: [
    { id: '1', name: 'Website Visit', order: 0, conversionRate: 8, monthlyVolume: 10000, isTrackable: true },
    { id: '2', name: 'Email Captured', order: 1, conversionRate: 25, monthlyVolume: 800, isTrackable: true },
    { id: '3', name: 'Application Started', order: 2, conversionRate: 60, monthlyVolume: 200, isTrackable: true },
    { id: '4', name: 'Signup Complete', order: 3, conversionRate: 40, monthlyVolume: 120, isTrackable: true },
    { id: '5', name: 'First Transaction', order: 4, conversionRate: 50, monthlyVolume: 48, isTrackable: true },
    { id: '6', name: 'Activated', order: 5, conversionRate: 100, monthlyVolume: 24, isTrackable: true },
  ],
  metrics: {
    ltv: 5700,
    ltvCacRatio: 4,
    grossMargin: 100,
    currency: 'AUD'
  },
  segments: [
    { id: '1', name: 'Business Email', multiplier: 1.5, identificationRule: { type: 'email_domain', condition: 'not_in_blocklist' } },
    { id: '2', name: 'Consumer Email', multiplier: 0.1, identificationRule: { type: 'email_domain', condition: 'in_blocklist' } },
  ],
  scoringRules: []
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      
      setFunnel: (funnel) => set({ funnel }),
      updateStep: (id, updates) => set((state) => ({
        funnel: state.funnel.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      addStep: (step) => set((state) => ({
        funnel: [...state.funnel, step]
      })),
      removeStep: (id) => set((state) => ({
        funnel: state.funnel.filter(s => s.id !== id)
      })),
      reorderSteps: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.funnel);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { funnel: result.map((s, i) => ({ ...s, order: i })) };
      }),
      
      setMetrics: (metrics) => set({ metrics }),
      
      setSegments: (segments) => set({ segments }),
      addSegment: (segment) => set((state) => ({
        segments: [...state.segments, segment]
      })),
      updateSegment: (id, updates) => set((state) => ({
        segments: state.segments.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      removeSegment: (id) => set((state) => ({
        segments: state.segments.filter(s => s.id !== id)
      })),
      
      setScoringRules: (scoringRules) => set({ scoringRules }),
      
      reset: () => set(DEFAULT_STATE)
    }),
    {
      name: 'signalstack-storage',
      version: 1
    }
  )
);
```

### Export Functions

```typescript
// lib/export.ts

export function exportToCSV(values: CalculatedValue[], segments: AudienceSegment[]): string {
  const headers = [
    'Event',
    'Monthly Volume',
    'Volume Status',
    'Cumulative Probability',
    'Base Value',
    ...segments.map(s => `${s.name} Value`),
    'Recommendation'
  ];
  
  const rows = values.map(v => [
    v.stepName,
    v.monthlyVolume,
    v.volumeStatus,
    (v.cumulativeProbability * 100).toFixed(2) + '%',
    '$' + v.baseValue.toFixed(2),
    ...segments.map(s => '$' + (v.segmentValues[s.id] || 0).toFixed(2)),
    v.recommendation
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

export function exportToJSON(state: StoredState): string {
  return JSON.stringify(state, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### GTM Container Parser

```typescript
// lib/gtmParser.ts

interface GTMContainer {
  containerVersion: {
    tag?: GTMTag[];
    trigger?: GTMTrigger[];
    variable?: GTMVariable[];
  };
}

interface ValidationResult {
  check: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

export function parseGTMContainer(json: string): GTMContainer {
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid GTM container JSON');
  }
}

export function validateContainer(
  container: GTMContainer,
  expectedEvents: string[]
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const tags = container.containerVersion.tag || [];
  const variables = container.containerVersion.variable || [];
  
  // Check 1: All expected events have tags
  for (const event of expectedEvents) {
    const hasTag = tags.some(tag => 
      JSON.stringify(tag).toLowerCase().includes(event.toLowerCase())
    );
    if (!hasTag) {
      results.push({
        check: 'event_exists',
        severity: 'error',
        message: `No tag found for event: ${event}`
      });
    }
  }
  
  // Check 2: Meta Pixel tags have event_id
  const metaTags = tags.filter(t => 
    t.type === 'floodlight' || // Meta pixel type varies
    JSON.stringify(t).includes('facebook') ||
    JSON.stringify(t).includes('meta')
  );
  
  for (const tag of metaTags) {
    const hasEventId = JSON.stringify(tag).includes('event_id');
    if (!hasEventId) {
      results.push({
        check: 'deduplication',
        severity: 'error',
        message: `Meta tag "${tag.name}" missing event_id for deduplication`
      });
    }
  }
  
  // Check 3: Consent Mode
  const hasConsentMode = tags.some(t => 
    JSON.stringify(t).includes('consent') ||
    JSON.stringify(t).includes('ad_storage')
  );
  if (!hasConsentMode) {
    results.push({
      check: 'consent_mode',
      severity: 'warning',
      message: 'Consent Mode not detected'
    });
  }
  
  // Check 4: CAPI/Server-side tags
  const hasServerSide = tags.some(t => 
    JSON.stringify(t).includes('server') ||
    t.type?.includes('server')
  );
  if (!hasServerSide) {
    results.push({
      check: 'server_side',
      severity: 'info',
      message: 'No server-side tags detected. Consider implementing CAPI.'
    });
  }
  
  return results;
}
```

---

## Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Create new React app with TypeScript
npx create-react-app signalstack --template typescript

# Install dependencies
cd signalstack
npm install zustand @dnd-kit/core @dnd-kit/sortable recharts file-saver
npm install -D tailwindcss postcss autoprefixer @types/file-saver

# Initialize Tailwind
npx tailwindcss init -p
```

### Project Structure Setup

```bash
# Create directory structure
mkdir -p src/{components/{common,funnel,metrics,segments,results},hooks,lib,store,pages}

# Create initial files
touch src/store/useStore.ts
touch src/lib/{calculations,validation,export,constants}.ts
touch src/hooks/{useCalculator,useLocalStorage,useFunnel}.ts
```

### Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

---

## Appendix: Platform-Specific Reference

### Meta CAPI Event Names

| SignalStack Event | Meta Standard Event |
|-------------------|---------------------|
| email_captured | Lead |
| application_started | InitiateCheckout |
| signup_complete | CompleteRegistration |
| first_transaction | Purchase |
| activated | Purchase (with different content_name) |

### Google Ads Conversion Actions

| SignalStack Event | Recommended Action Name |
|-------------------|------------------------|
| email_captured | Lead - Email Signup |
| application_started | Lead - Application Started |
| signup_complete | Conversion - Signup |
| first_transaction | Conversion - First Transaction |
| activated | Conversion - Activated Customer |

### Attribution Windows

| Platform | Default Window | Maximum Window |
|----------|----------------|----------------|
| Meta (click) | 7 days | 7 days |
| Meta (view) | 1 day | 1 day |
| Google Ads | 30 days | 90 days |
| GA4 | 30 days | 90 days |

---

*End of PRD*
