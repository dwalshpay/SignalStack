# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SignalStack is a B2B ad signal optimisation tool that helps marketing teams implement value-based bidding. It calculates conversion values based on funnel data and LTV, generates implementation specs for ad platforms (Meta, Google Ads), validates GTM setups, and filters consumer traffic.

## Build Approach

- **Phases 1-3**: Client-side React application, no backend required, uses LocalStorage
- **Phase 4**: Adds Node.js backend with PostgreSQL for live integrations

## Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- Zustand for state management (with persist middleware for LocalStorage)
- React Hook Form for forms
- @dnd-kit/core and @dnd-kit/sortable for drag-and-drop
- Recharts for visualisations
- FileSaver.js for exports

**Backend (Phase 4):**
- Node.js with Express
- PostgreSQL with Prisma ORM
- Bull for job queues
- JWT authentication

## Development Commands

```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

## Project Structure

```
src/
├── components/
│   ├── common/         # Reusable UI components (Button, Input, Card, Badge, Table)
│   ├── funnel/         # Funnel builder components
│   ├── metrics/        # Business metrics input components
│   ├── segments/       # Audience segment components
│   └── results/        # Value table and export components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions (calculations, validation, export, constants)
├── store/              # Zustand store (useStore.ts)
└── pages/              # Page components
```

## Architecture Notes

### Core Calculation Logic

The value calculation engine uses this formula:
```
Event Value = Target CAC × Cumulative Conversion Probability
Where: Cumulative Probability = Product of all downstream conversion rates
```

Target CAC is derived from: `LTV / LTV:CAC Ratio × (Gross Margin / 100)`

### Volume Thresholds

Platform-specific thresholds for conversion optimisation:
- Google Ads: 15 min, 50+ recommended (per 30 days)
- Meta: 200 min (50/week × 4), 200 recommended (per 30 days)

### State Management

Uses Zustand with persist middleware. State is stored in LocalStorage under key `signalstack-storage`. The store manages: funnel steps, business metrics, audience segments, and scoring rules.

### Key Data Types

- `FunnelStep`: Conversion funnel stages with rates and volumes
- `BusinessMetrics`: LTV, LTV:CAC ratio, gross margin, currency
- `AudienceSegment`: Segment multipliers (e.g., business email 1.5x, consumer 0.1x)
- `CalculatedValue`: Computed values per funnel step with volume status

## Consumer Email Filtering

The app includes blocklists for consumer email domains (gmail, yahoo, hotmail, etc.) and Australian ISPs (bigpond, optusnet, etc.). See the PRD for the full domain list.

## GTM Validation

When validating GTM containers:
- Check all funnel events have corresponding tags
- Verify Meta Pixel tags have event_id for deduplication
- Check for Consent Mode v2 configuration
- Verify PII is SHA-256 hashed before sending
