import type { FunnelStep, CalculatedValue } from '@/types';

/**
 * Convert step name to snake_case event name
 */
function toEventName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Generate CSV template for Google Ads offline conversions
 */
export function generateGoogleOfflineTemplate(
  steps: FunnelStep[],
  values: CalculatedValue[],
  currency: string
): string {
  const headers = ['Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency'];

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  const rows = sortedSteps.map((step) => {
    const value = values.find((v) => v.stepId === step.id);
    const eventName = step.eventName || toEventName(step.name);
    const baseValue = value?.baseValue ?? 0;

    return [
      '{{GCLID}}',
      eventName,
      '{{YYYY-MM-DD HH:MM:SS+TZ}}',
      baseValue.toFixed(2),
      currency,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate empty template for user to fill
 */
export function generateEmptyTemplate(currency: string): string {
  return `Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
EXAMPLE_GCLID_123,email_captured,2024-01-15 14:30:00+11:00,285.00,${currency}
EXAMPLE_GCLID_456,signup_complete,2024-01-15 15:45:00+11:00,570.00,${currency}`;
}

/**
 * Generate upload instructions for Google Ads offline conversions
 */
export function generateGoogleOfflineInstructions(): string {
  return `# Google Ads Offline Conversion Upload Guide

## Prerequisites
1. Google Ads account with conversion tracking enabled
2. GCLID (Google Click ID) capture implemented on your website
3. Conversion actions created in Google Ads for each funnel event

## GCLID Capture Implementation

Add this code to your website to capture the GCLID from ad clicks:

\`\`\`javascript
// Capture GCLID on page load
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const gclid = urlParams.get('gclid');

  if (gclid) {
    // Store in cookie for 90 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 90);
    document.cookie = \`gclid=\${gclid};expires=\${expires.toUTCString()};path=/\`;

    // Also store in localStorage as backup
    localStorage.setItem('gclid', gclid);
    localStorage.setItem('gclid_timestamp', Date.now().toString());
  }
})();

// Retrieve GCLID when needed
function getGCLID() {
  // Try cookie first
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'gclid') return value;
  }

  // Fall back to localStorage
  const stored = localStorage.getItem('gclid');
  const timestamp = localStorage.getItem('gclid_timestamp');

  // Check if within 90 day window
  if (stored && timestamp) {
    const daysSinceCapture = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
    if (daysSinceCapture <= 90) return stored;
  }

  return null;
}
\`\`\`

## CSV Format Requirements

| Column | Format | Example |
|--------|--------|---------|
| Google Click ID | String | EAIaIQobChMI... |
| Conversion Name | String (must match Google Ads) | email_captured |
| Conversion Time | YYYY-MM-DD HH:MM:SS±TZ | 2024-01-15 14:30:00+11:00 |
| Conversion Value | Decimal | 285.00 |
| Conversion Currency | ISO 4217 | AUD |

## Time Zone Format
- Use your local timezone offset
- Australia/Sydney: +11:00 (AEDT) or +10:00 (AEST)
- UTC: +00:00 or Z

## Upload Process

1. **Navigate to Conversions**
   - Go to Google Ads > Tools & Settings > Measurement > Conversions

2. **Select Uploads**
   - Click "Uploads" in the left menu

3. **Upload File**
   - Click the + button
   - Select "Upload conversions from a file"
   - Choose your CSV file

4. **Review and Confirm**
   - Preview the data mapping
   - Verify conversion names match your configured actions
   - Submit the upload

## Best Practices

- **Upload Frequency**: Daily or weekly for timely attribution
- **Conversion Lag**: Upload within 90 days of the click
- **Deduplication**: Include transaction IDs to prevent duplicates
- **Testing**: Use a small batch first to verify format

## Enhanced Conversions (Recommended)

For better match rates, consider enabling Enhanced Conversions:
- Hash user email (SHA-256, lowercase)
- Include phone number (E.164 format, hashed)
- Add address data where available

See Google's Enhanced Conversions setup guide for implementation details.`;
}
