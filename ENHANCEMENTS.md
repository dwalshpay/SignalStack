# SignalStack Enhancement Recommendations

**Review Date:** January 15, 2026
**Reviewed By:** Claude Code
**Current Phase:** Phase 4 Complete

This document captures recommended enhancements identified from a thorough review of the SignalStack application against the PRD. These exclude additional integrations (Amplitude, Salesforce, Clearbit) which are already tracked as deferred items.

---

## High Priority - Missing PRD Features

### 1. Industry-Specific Negative Keywords

**Gap:** PRD Section 2.6 specifies `INDUSTRY_NEGATIVES` with payments and SaaS-specific keywords. Current implementation only has generic categories.

**Current State:**
- Categories: free_seeker, job_seeker, student, informational, consumer_email
- No industry-specific filtering

**Recommendation:**
- Add industry dropdown (payments, SaaS, finance, healthcare, etc.)
- Include PRD-specified keywords:
  ```javascript
  payments: ['personal payments', 'send money to friend', 'venmo', 'paypal personal', 'split bill']
  saas: ['free trial forever', 'open source alternative', 'free version']
  ```

**Files to Modify:**
- `src/components/implementation/NegativeKeywords.tsx`
- `src/lib/generators/negativeKeywords.ts`

---

### 2. Dual-Platform Volume Status Display

**Gap:** PRD shows different thresholds for Google vs Meta, but UI shows single status badge.

**Platform Thresholds (from PRD):**
| Platform | Minimum | Recommended |
|----------|---------|-------------|
| Google Ads | 15/30 days | 50/30 days |
| Meta | 200/30 days | 200/30 days |

**Current State:**
- Single "volume status" badge per funnel step
- Uses Google thresholds only (15/50)

**Recommendation:**
- Add separate Google/Meta status columns in results table
- Show platform-specific recommendations ("Sufficient for Google, Insufficient for Meta")
- Color-code per platform

**Files to Modify:**
- `src/lib/calculations.ts` - Add platform-specific status function
- `src/components/results/` - Update table columns

---

### 3. Breakeven Analysis / "What-if" Scenarios

**Gap:** PRD Section 1.7 mentions specific scenarios not fully implemented.

**PRD Scenarios:**
- "What if we improve conversion rate at step X?" ✅ Implemented
- "What if we increase LTV:CAC target to 5:1?" ✅ Implemented
- "At what conversion rate does consumer traffic become worth bidding on?" ❌ Missing

**Recommendation:**
- Add breakeven calculator that auto-calculates:
  - Minimum conversion rate for positive ROI at each step
  - Multiplier threshold where consumer segment becomes profitable
  - Volume needed to reach platform thresholds

**Files to Modify:**
- `src/hooks/useScenarios.ts` - Add breakeven calculation
- `src/components/results/ScenarioCompare.tsx` - Add breakeven display

---

### 4. Alert Configuration UI

**Gap:** PRD defines `ALERT_RULES` but no UI to configure them.

**PRD Alert Rules:**
```javascript
ALERT_RULES = [
  { metric: 'emq_score', condition: 'drops_below', threshold: 7.0, window: '24h', severity: 'warning' },
  { metric: 'event_volume', condition: 'drops_by_percent', threshold: 30, window: '24h', severity: 'critical' },
  { metric: 'conversion_rate', condition: 'changes_by_percent', threshold: 20, window: '7d', severity: 'info' }
]
```

**Current State:**
- Alerts displayed in monitoring dashboard
- No configuration UI
- Thresholds are hardcoded

**Recommendation:**
- Add "Alerts" tab in Settings page
- Allow customization of thresholds, windows, severity
- Add notification preferences (email, browser notifications)

**Files to Create/Modify:**
- `src/components/settings/AlertSettings.tsx` (new)
- `src/pages/Settings.tsx` - Add alerts tab
- `src/store/useStore.ts` - Add alert configuration state

---

## Medium Priority - UX Improvements

### 5. Multi-Funnel Support

**Gap:** No ability to save multiple named funnel configurations.

**Use Cases:**
- Agencies managing multiple clients
- Teams with different product lines
- A/B testing different funnel structures

**Recommendation:**
- Add funnel selector dropdown in header
- Save/Load/Rename/Delete funnel configurations
- Store multiple funnels in localStorage/backend

**Files to Modify:**
- `src/store/useStore.ts` - Support multiple funnels
- `src/components/layout/Header.tsx` - Add funnel selector
- `src/pages/Calculator.tsx` - Funnel management UI

---

### 6. Import Configuration

**Gap:** JSON export exists but no import functionality.

**Current State:**
- Can export full state as JSON
- No way to import/restore

**Recommendation:**
- Add "Import Configuration" button alongside Export
- Validate imported JSON structure
- Merge vs replace option

**Files to Modify:**
- `src/pages/Calculator.tsx` - Add import button
- `src/lib/export.ts` - Add import/validation function

---

### 7. Onboarding / First-Time User Experience

**Gap:** No guided setup for new users.

**Recommendation:**
- Welcome modal on first visit explaining the tool
- Tooltips on key inputs (LTV, CAC ratio, etc.)
- Optional product tour (react-joyride or similar)
- Contextual help icons linking to documentation

**Files to Create:**
- `src/components/common/Tooltip.tsx` - Enhanced with help content
- `src/components/onboarding/WelcomeModal.tsx` (new)
- `src/components/onboarding/ProductTour.tsx` (new)

---

### 8. GTM Validation History & Diff

**Gap:** Validates single container without comparison to previous.

**Current State:**
- Upload GTM JSON, get validation results
- No history or comparison

**Recommendation:**
- Store last N validation results in localStorage
- Show diff when re-uploading same container
- Track remediation progress over time
- Export validation report as PDF/MD

**Files to Modify:**
- `src/store/useStore.ts` - Add validation history
- `src/components/validation/GTMValidator.tsx` - Show history/diff

---

### 9. Custom Date Range for Monitoring

**Gap:** Fixed windows (7/30/90 days) but no custom date picker.

**Current State:**
- Hardcoded time period buttons
- No custom range selection

**Recommendation:**
- Add date range picker component
- Support custom start/end dates
- Persist last selected range

**Files to Modify:**
- `src/pages/Monitoring.tsx` - Add date picker
- `src/hooks/useMonitoring.ts` - Accept date range params

---

### 10. Undo/Redo for Funnel & Scoring Rules

**Gap:** No way to revert accidental changes.

**Recommendation:**
- Implement undo/redo stack for:
  - Funnel step changes (add, remove, reorder, edit)
  - Segment changes
  - Scoring rule changes
- Keyboard shortcuts: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z
- Consider: Zustand temporal middleware

**Files to Modify:**
- `src/store/useStore.ts` - Add temporal middleware
- `src/components/layout/Header.tsx` - Add undo/redo buttons

---

## Lower Priority - Polish & Insights

### 11. Export Monitoring Dashboard

**Gap:** No ability to export monitoring charts/data.

**Recommendation:**
- PNG export for charts (html2canvas)
- CSV export for tabular data
- PDF report generation
- Useful for stakeholder reporting

**Files to Modify:**
- `src/pages/Monitoring.tsx` - Add export buttons
- `src/components/monitoring/*.tsx` - Add export handlers

---

### 12. Keyboard Shortcuts

**Gap:** No keyboard shortcuts for power users.

**Recommended Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save/Export |
| `Cmd/Ctrl + N` | Add new step |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `?` | Show shortcut help |
| `1-4` | Navigate to tabs |

**Files to Create:**
- `src/hooks/useKeyboardShortcuts.ts` (new)
- `src/components/common/ShortcutHelp.tsx` (new)

---

### 13. Historical Value Tracking

**Gap:** No local history of calculated values over time.

**Recommendation:**
- Optional timestamped snapshots in localStorage
- Show trend line of value changes
- Useful for tracking impact of funnel optimizations

**Files to Create:**
- `src/hooks/useValueHistory.ts` (new)
- `src/components/results/ValueTrend.tsx` (new)

---

### 14. ROI/Payback Calculator

**Gap:** PRD mentions "CAC payback period" as a success metric but no calculator.

**Recommendation:**
- Add ROI calculator showing:
  - Months to CAC payback
  - Projected annual ROI
  - Break-even point
- Display alongside business metrics

**Files to Create:**
- `src/components/metrics/ROICalculator.tsx` (new)

---

### 15. Empty State Handling

**Gap:** Need to verify graceful handling of zero-data states.

**Areas to Check:**
- Empty funnel (no steps)
- No scoring rules configured
- No segments defined
- Empty monitoring data (new account)

**Recommendation:**
- Audit all components for empty states
- Add helpful prompts/CTAs when data is missing

---

### 16. Mobile Responsiveness Audit

**Gap:** PRD defines breakpoints but mobile UX unverified.

**Areas to Focus:**
- Calculator page layout on mobile
- Drag-and-drop on touch devices
- Table scrolling/overflow
- Modal sizing

**Recommendation:**
- Test on iOS Safari, Chrome mobile
- Consider touch-friendly alternatives to drag-and-drop
- Ensure tap targets are 44px minimum

---

## Quick Wins

### 17. Consumer Traffic "Worth It?" Indicator
Show when consumer segment value exceeds minimum bid thresholds. Simple visual indicator for "even consumer traffic is worth something."

### 18. Copy Individual Values
Add copy button per cell in results table for quick value insertion into ad platforms.

### 19. Platform Event Name Mapping
Display SignalStack → Meta/Google event name mapping (from PRD Appendix) in Data Layer Generator.

### 20. Sticky Header on Value Table
Make column headers sticky when scrolling long funnel lists.

---

## Summary Table

| # | Enhancement | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 1 | Industry-specific negative keywords | High | Medium | Not Started |
| 2 | Dual-platform volume display | High | Low | Not Started |
| 3 | Breakeven analysis | High | Medium | Not Started |
| 4 | Alert configuration UI | High | Medium | Not Started |
| 5 | Multi-funnel support | Medium | High | Not Started |
| 6 | Import configuration | Medium | Low | Not Started |
| 7 | Onboarding experience | Medium | Medium | Not Started |
| 8 | GTM validation history | Medium | Medium | Not Started |
| 9 | Custom monitoring date range | Medium | Low | Not Started |
| 10 | Undo/redo | Medium | High | Not Started |
| 11 | Export monitoring data | Low | Low | Not Started |
| 12 | Keyboard shortcuts | Low | Low | Not Started |
| 13 | Historical value tracking | Low | Medium | Not Started |
| 14 | ROI calculator | Low | Low | Not Started |
| 15 | Empty state handling | Low | Low | Not Started |
| 16 | Mobile responsiveness audit | Low | Medium | Not Started |
| 17 | Consumer "worth it" indicator | Quick Win | Low | Not Started |
| 18 | Copy individual values | Quick Win | Low | Not Started |
| 19 | Platform event name mapping | Quick Win | Low | Not Started |
| 20 | Sticky table headers | Quick Win | Low | Not Started |

---

## Next Steps

1. Prioritize based on user feedback and business impact
2. Create GitHub issues for tracking
3. Estimate sprint capacity for implementation
4. Consider bundling related items (e.g., all monitoring enhancements together)

---

*This document should be updated as enhancements are implemented or requirements change.*
