import type { FunnelStep, CalculatedValue, AudienceSegment } from '@/types';

export interface MetaCAPIPayload {
  eventName: string;
  stepName: string;
  metaEventName: string;
  payload: object;
  curlExample: string;
}

/**
 * Map funnel event names to standard Meta event names
 */
function mapToMetaEvent(eventName: string): string {
  const mappings: Record<string, string> = {
    'website_visit': 'PageView',
    'email_captured': 'Lead',
    'application_started': 'InitiateCheckout',
    'signup_complete': 'CompleteRegistration',
    'first_transaction': 'Purchase',
    'activated': 'Subscribe',
  };

  return mappings[eventName] || 'Lead';
}

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
 * Generate Meta CAPI payloads for all funnel events
 */
export function generateMetaCAPIPayloads(
  steps: FunnelStep[],
  values: CalculatedValue[],
  _segments: AudienceSegment[],
  currency: string,
  pixelId: string = 'YOUR_PIXEL_ID'
): MetaCAPIPayload[] {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return sortedSteps.map((step) => {
    const value = values.find((v) => v.stepId === step.id);
    const eventName = step.eventName || toEventName(step.name);
    const metaEventName = mapToMetaEvent(eventName);
    const baseValue = value?.baseValue ?? 0;

    const payload = {
      data: [
        {
          event_name: metaEventName,
          event_time: '{{UNIX_TIMESTAMP}}',
          event_id: '{{EVENT_ID}}', // Must match browser event_id for deduplication
          action_source: 'website',
          event_source_url: '{{PAGE_URL}}',
          user_data: {
            em: ['{{HASHED_EMAIL}}'], // SHA-256 lowercase
            ph: ['{{HASHED_PHONE}}'], // E.164 format, SHA-256
            client_ip_address: '{{CLIENT_IP}}',
            client_user_agent: '{{USER_AGENT}}',
            fbc: '{{FBC_COOKIE}}', // _fbc cookie value
            fbp: '{{FBP_COOKIE}}', // _fbp cookie value
            external_id: ['{{EXTERNAL_USER_ID}}'],
          },
          custom_data: {
            currency: currency,
            value: baseValue,
            content_name: step.name,
            content_category: 'conversion',
          },
        },
      ],
    };

    const curlExample = `curl -X POST \\
  "https://graph.facebook.com/v18.0/${pixelId}/events?access_token=YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;

    return {
      eventName,
      stepName: step.name,
      metaEventName,
      payload,
      curlExample,
    };
  });
}

/**
 * Generate EMQ (Event Match Quality) guidance
 */
export function generateEMQGuidance(): string {
  return `# Event Match Quality (EMQ) Optimization Guide

## Priority Match Keys (send as many as possible)

### HIGH PRIORITY (Essential for good match rates)
- **em** (email): SHA-256 hash of lowercase, trimmed email
- **ph** (phone): SHA-256 hash of E.164 format (e.g., +61412345678)
- **fbc**: Facebook click ID from _fbc cookie
- **fbp**: Facebook browser ID from _fbp cookie

### MEDIUM PRIORITY (Improves match quality)
- **external_id**: Your internal user/customer ID (hashed)
- **client_ip_address**: User's IP address
- **client_user_agent**: Browser user agent string

### INCREMENTAL (Additional lift)
- **fn** (first name): SHA-256 lowercase
- **ln** (last name): SHA-256 lowercase
- **ct** (city): SHA-256 lowercase, no spaces
- **st** (state): SHA-256 2-letter code
- **zp** (zip): SHA-256
- **country**: SHA-256 2-letter code

## Data Normalization Rules

### Email
1. Convert to lowercase
2. Remove leading/trailing whitespace
3. Hash with SHA-256

### Phone (E.164 Format)
1. Remove all non-numeric characters except leading +
2. Include country code (e.g., +61 for Australia)
3. Hash with SHA-256

### Names
1. Convert to lowercase
2. Remove special characters
3. Trim whitespace
4. Hash with SHA-256

## Target EMQ Scores
- **Poor**: < 5.0 - Improve immediately
- **Fair**: 5.0 - 7.0 - Room for improvement
- **Good**: 7.0 - 9.0 - Meeting expectations
- **Excellent**: > 9.0 - Optimal performance`;
}

/**
 * Generate server-side implementation example
 */
export function generateServerImplementation(currency: string): string {
  return `// Node.js Server-Side Meta CAPI Implementation
// Install: npm install node-fetch crypto

const crypto = require('crypto');
const fetch = require('node-fetch');

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

/**
 * Hash user data with SHA-256
 */
function hashData(data) {
  if (!data) return null;
  const normalized = String(data).toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Format phone to E.164 and hash
 */
function hashPhone(phone, countryCode = '+61') {
  if (!phone) return null;
  // Remove non-numeric except leading +
  let cleaned = phone.replace(/[^\\d+]/g, '');
  // Add country code if missing
  if (!cleaned.startsWith('+')) {
    cleaned = countryCode + cleaned.replace(/^0/, '');
  }
  return hashData(cleaned);
}

/**
 * Send event to Meta Conversions API
 */
async function sendMetaEvent(eventData) {
  const { eventName, eventId, email, phone, ip, userAgent, url, value, fbc, fbp, externalId } = eventData;

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: url,
      user_data: {
        em: email ? [hashData(email)] : undefined,
        ph: phone ? [hashPhone(phone)] : undefined,
        client_ip_address: ip,
        client_user_agent: userAgent,
        fbc: fbc,
        fbp: fbp,
        external_id: externalId ? [hashData(externalId)] : undefined,
      },
      custom_data: {
        currency: '${currency}',
        value: value,
      },
    }],
  };

  // Remove undefined values
  Object.keys(payload.data[0].user_data).forEach(key => {
    if (payload.data[0].user_data[key] === undefined) {
      delete payload.data[0].user_data[key];
    }
  });

  const response = await fetch(
    \`https://graph.facebook.com/v18.0/\${PIXEL_ID}/events?access_token=\${ACCESS_TOKEN}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  return response.json();
}

// Example usage:
// sendMetaEvent({
//   eventName: 'Lead',
//   eventId: 'evt_123456',
//   email: 'user@example.com',
//   phone: '0412345678',
//   ip: req.ip,
//   userAgent: req.headers['user-agent'],
//   url: req.originalUrl,
//   value: 285.00,
//   fbc: req.cookies._fbc,
//   fbp: req.cookies._fbp,
// });

module.exports = { sendMetaEvent, hashData, hashPhone };`;
}
