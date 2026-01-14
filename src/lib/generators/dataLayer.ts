import type { FunnelStep, CalculatedValue, AudienceSegment } from '@/types';

export interface DataLayerEvent {
  eventName: string;
  stepName: string;
  code: string;
  description: string;
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
 * Generate data layer push code for all funnel events
 */
export function generateDataLayerCode(
  steps: FunnelStep[],
  values: CalculatedValue[],
  segments: AudienceSegment[],
  currency: string
): DataLayerEvent[] {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return sortedSteps.map((step) => {
    const value = values.find((v) => v.stepId === step.id);
    const eventName = step.eventName || toEventName(step.name);
    const baseValue = value?.baseValue ?? 0;

    // Build segment value comments
    const segmentComments = segments
      .map((seg) => {
        const segValue = value?.segmentValues[seg.id] ?? baseValue * seg.multiplier;
        return `  // ${seg.name}: ${segValue.toFixed(2)} ${currency}`;
      })
      .join('\n');

    const code = `// ${step.name} - Event Value: ${baseValue.toFixed(2)} ${currency}
${segmentComments}
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': '${eventName}',
  'event_category': 'conversion',
  'event_id': generateEventId(), // Unique ID for deduplication
  'event_value': getSegmentValue(), // Use segment-specific value
  'currency': '${currency}',
  'user_data': {
    'email_hash': hashEmail(userEmail), // SHA-256 hashed, lowercase
    'user_segment': getUserSegment(userEmail) // 'business' or 'consumer'
  }
});`;

    return {
      eventName,
      stepName: step.name,
      code,
      description: `Fire when user completes ${step.name.toLowerCase()}`,
    };
  });
}

/**
 * Generate helper functions for data layer implementation
 */
export function generateHelperFunctions(): string {
  return `// Helper functions for SignalStack data layer implementation

/**
 * Generate unique event ID for deduplication across browser and server events
 */
function generateEventId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * SHA-256 hash for user data (email, phone, etc.)
 * Email should be lowercase and trimmed before hashing
 */
async function hashEmail(email) {
  const normalized = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Determine user segment based on email domain
 */
function getUserSegment(email) {
  const consumerDomains = [
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.com.au',
    'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com', 'aol.com',
    'protonmail.com', 'proton.me', 'zoho.com', 'mail.com', 'email.com',
    'gmx.com', 'gmx.net', 'bigpond.com', 'bigpond.net.au', 'optusnet.com.au'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return consumerDomains.includes(domain) ? 'consumer' : 'business';
}

/**
 * Get segment-specific event value
 */
function getSegmentValue() {
  const segment = getUserSegment(userEmail);
  // Replace with your calculated segment values from SignalStack
  const segmentValues = {
    'business': {{BUSINESS_VALUE}},
    'consumer': {{CONSUMER_VALUE}}
  };
  return segmentValues[segment] || segmentValues['business'];
}`;
}

/**
 * Generate complete data layer implementation code
 */
export function generateCompleteDataLayerCode(
  steps: FunnelStep[],
  values: CalculatedValue[],
  segments: AudienceSegment[],
  currency: string
): string {
  const events = generateDataLayerCode(steps, values, segments, currency);
  const helpers = generateHelperFunctions();

  // Get segment values for the helper function
  const businessSegment = segments.find((s) => s.name.toLowerCase().includes('business'));
  const consumerSegment = segments.find((s) => s.name.toLowerCase().includes('consumer'));

  // Use first event's values as example
  const firstValue = values[0];
  const businessValue = firstValue?.segmentValues[businessSegment?.id ?? ''] ?? firstValue?.baseValue ?? 0;
  const consumerValue = firstValue?.segmentValues[consumerSegment?.id ?? ''] ?? (firstValue?.baseValue ?? 0) * 0.1;

  const helpersWithValues = helpers
    .replace('{{BUSINESS_VALUE}}', businessValue.toFixed(2))
    .replace('{{CONSUMER_VALUE}}', consumerValue.toFixed(2));

  const eventCodes = events.map((e) => e.code).join('\n\n');

  return `${helpersWithValues}

// ============================================
// Event-specific data layer pushes
// ============================================

${eventCodes}`;
}
