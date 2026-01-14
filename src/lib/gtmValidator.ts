import type { ValidationIssue, GTMValidationResult, ValidationSeverity } from '@/types';
import { VALIDATION_CHECKS } from './constants';
import { calculateEMQScore } from './emqCalculator';

// GTM Container Types
interface GTMParameter {
  key: string;
  value?: string;
  list?: Array<{ key: string; value: string }>;
  map?: Array<{ key: string; value: string }>;
  type?: string;
}

interface GTMTag {
  tagId: string;
  name: string;
  type: string;
  parameter?: GTMParameter[];
  firingTriggerId?: string[];
}

interface GTMTrigger {
  triggerId: string;
  name: string;
  type: string;
  filter?: Array<{ parameter: GTMParameter[] }>;
  customEventFilter?: Array<{ parameter: GTMParameter[] }>;
}

interface GTMVariable {
  variableId: string;
  name: string;
  type: string;
  parameter?: GTMParameter[];
}

interface GTMContainer {
  exportFormatVersion: number;
  containerVersion: {
    container?: { name: string; publicId: string };
    tag?: GTMTag[];
    trigger?: GTMTrigger[];
    variable?: GTMVariable[];
  };
}

let issueIdCounter = 0;

function generateIssueId(): string {
  return `issue-${++issueIdCounter}`;
}

function createIssue(
  code: string,
  severity: ValidationSeverity,
  title: string,
  description: string,
  recommendation: string,
  affectedItems?: string[]
): ValidationIssue {
  return {
    id: generateIssueId(),
    severity,
    code,
    title,
    description,
    recommendation,
    affectedItems,
  };
}

/**
 * Extracts event names from GTM tags
 */
function extractEventNamesFromTags(container: GTMContainer): string[] {
  const eventNames: string[] = [];
  const tags = container.containerVersion.tag || [];

  for (const tag of tags) {
    // Check tag name
    eventNames.push(tag.name.toLowerCase());

    // Check event parameters
    if (tag.parameter) {
      for (const param of tag.parameter) {
        if (param.key === 'eventName' && param.value) {
          eventNames.push(param.value.toLowerCase());
        }
      }
    }
  }

  return eventNames;
}

/**
 * Checks if any Meta Pixel/CAPI tags have event_id
 */
function checkEventIdForDedup(container: GTMContainer): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tags = container.containerVersion.tag || [];

  const metaTags = tags.filter(
    (t) => t.type.includes('facebook') || t.type.includes('meta') || t.name.toLowerCase().includes('meta') || t.name.toLowerCase().includes('pixel')
  );

  for (const tag of metaTags) {
    let hasEventId = false;

    if (tag.parameter) {
      for (const param of tag.parameter) {
        if (param.key === 'eventId' || param.key === 'event_id') {
          hasEventId = true;
          break;
        }
        // Check nested parameters
        if (param.list) {
          for (const item of param.list) {
            if (item.key === 'eventId' || item.key === 'event_id') {
              hasEventId = true;
              break;
            }
          }
        }
      }
    }

    if (!hasEventId) {
      issues.push(
        createIssue(
          VALIDATION_CHECKS.NO_EVENT_ID.code,
          VALIDATION_CHECKS.NO_EVENT_ID.severity,
          VALIDATION_CHECKS.NO_EVENT_ID.title,
          `Tag "${tag.name}" does not include an event_id for deduplication`,
          'Add an event_id parameter that matches between browser and server-side events',
          [tag.name]
        )
      );
    }
  }

  return issues;
}

/**
 * Checks if conversion tags have value parameters
 */
function checkEventValues(container: GTMContainer): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tags = container.containerVersion.tag || [];

  const conversionTags = tags.filter(
    (t) =>
      t.type.includes('conversion') ||
      t.name.toLowerCase().includes('conversion') ||
      t.name.toLowerCase().includes('purchase') ||
      t.name.toLowerCase().includes('lead')
  );

  for (const tag of conversionTags) {
    let hasValue = false;

    if (tag.parameter) {
      for (const param of tag.parameter) {
        if (param.key === 'value' || param.key === 'conversionValue') {
          hasValue = true;
          break;
        }
      }
    }

    if (!hasValue) {
      issues.push(
        createIssue(
          VALIDATION_CHECKS.NO_EVENT_VALUE.code,
          VALIDATION_CHECKS.NO_EVENT_VALUE.severity,
          VALIDATION_CHECKS.NO_EVENT_VALUE.title,
          `Tag "${tag.name}" does not include a value parameter`,
          'Add a value parameter to enable value-based bidding optimisation',
          [tag.name]
        )
      );
    }
  }

  return issues;
}

/**
 * Detects available match keys from variables
 */
function detectMatchKeys(container: GTMContainer): string[] {
  const matchKeys: string[] = [];
  const variables = container.containerVersion.variable || [];
  const tags = container.containerVersion.tag || [];

  const matchKeyPatterns: Record<string, string[]> = {
    email: ['email', 'em', 'user_email', 'hashed_email'],
    phone: ['phone', 'ph', 'telephone', 'hashed_phone'],
    fbc: ['fbc', 'click_id', 'fbclid'],
    fbp: ['fbp', 'browser_id', '_fbp'],
    external_id: ['external_id', 'user_id', 'customer_id'],
    ip_address: ['ip', 'ip_address', 'client_ip'],
    user_agent: ['user_agent', 'ua'],
    city: ['city', 'ct'],
    state: ['state', 'st'],
    zip: ['zip', 'zipcode', 'zp', 'postal'],
    country: ['country', 'cn'],
  };

  // Check variables
  for (const variable of variables) {
    const varName = variable.name.toLowerCase();
    for (const [key, patterns] of Object.entries(matchKeyPatterns)) {
      if (patterns.some((p) => varName.includes(p))) {
        if (!matchKeys.includes(key)) {
          matchKeys.push(key);
        }
      }
    }
  }

  // Check tag parameters
  for (const tag of tags) {
    if (tag.parameter) {
      for (const param of tag.parameter) {
        const paramKey = param.key.toLowerCase();
        for (const [key, patterns] of Object.entries(matchKeyPatterns)) {
          if (patterns.some((p) => paramKey.includes(p))) {
            if (!matchKeys.includes(key)) {
              matchKeys.push(key);
            }
          }
        }
      }
    }
  }

  return matchKeys;
}

/**
 * Checks for SHA-256 hashing
 */
function checkDataHashing(container: GTMContainer): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const variables = container.containerVersion.variable || [];
  const tags = container.containerVersion.tag || [];

  // Look for PII fields without hashing
  const piiPatterns = ['email', 'phone', 'em', 'ph'];
  let hasHashingVariable = false;
  let hasPII = false;

  for (const variable of variables) {
    const varName = variable.name.toLowerCase();
    if (varName.includes('hash') || varName.includes('sha256')) {
      hasHashingVariable = true;
    }
    if (piiPatterns.some((p) => varName.includes(p) && !varName.includes('hash'))) {
      hasPII = true;
    }
  }

  // Check tags for direct PII usage
  for (const tag of tags) {
    if (tag.parameter) {
      for (const param of tag.parameter) {
        const paramKey = param.key.toLowerCase();
        const paramValue = param.value?.toLowerCase() || '';
        if (
          piiPatterns.some((p) => paramKey.includes(p) || paramValue.includes(p)) &&
          !paramKey.includes('hash') &&
          !paramValue.includes('hash')
        ) {
          hasPII = true;
        }
      }
    }
  }

  if (hasPII && !hasHashingVariable) {
    issues.push(
      createIssue(
        VALIDATION_CHECKS.UNHASHED_PII.code,
        VALIDATION_CHECKS.UNHASHED_PII.severity,
        VALIDATION_CHECKS.UNHASHED_PII.title,
        'PII fields detected without apparent SHA-256 hashing',
        'Ensure all email and phone data is SHA-256 hashed before sending to ad platforms'
      )
    );
  }

  return issues;
}

/**
 * Checks for Consent Mode configuration
 */
function checkConsentMode(container: GTMContainer): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tags = container.containerVersion.tag || [];
  const variables = container.containerVersion.variable || [];

  let hasConsentConfig = false;

  // Look for consent-related tags or variables
  for (const tag of tags) {
    if (tag.type.includes('consent') || tag.name.toLowerCase().includes('consent')) {
      hasConsentConfig = true;
      break;
    }
  }

  for (const variable of variables) {
    if (variable.name.toLowerCase().includes('consent')) {
      hasConsentConfig = true;
      break;
    }
  }

  if (!hasConsentConfig) {
    issues.push(
      createIssue(
        VALIDATION_CHECKS.NO_CONSENT_MODE.code,
        VALIDATION_CHECKS.NO_CONSENT_MODE.severity,
        VALIDATION_CHECKS.NO_CONSENT_MODE.title,
        'No Google Consent Mode v2 configuration detected',
        'Configure Consent Mode v2 for compliant data collection'
      )
    );
  }

  return issues;
}

/**
 * Checks for server-side (CAPI) tags
 */
function checkCAPITags(container: GTMContainer): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tags = container.containerVersion.tag || [];

  const hasCAPI = tags.some(
    (t) =>
      t.type.includes('server') ||
      t.type.includes('capi') ||
      t.name.toLowerCase().includes('server') ||
      t.name.toLowerCase().includes('capi')
  );

  if (!hasCAPI) {
    issues.push(
      createIssue(
        VALIDATION_CHECKS.NO_CAPI.code,
        VALIDATION_CHECKS.NO_CAPI.severity,
        VALIDATION_CHECKS.NO_CAPI.title,
        'No server-side tags detected in container',
        'Consider implementing server-side tagging for improved data quality and privacy compliance'
      )
    );
  }

  return issues;
}

/**
 * Checks trigger specificity
 */
function checkTriggerSpecificity(container: GTMContainer): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const triggers = container.containerVersion.trigger || [];

  for (const trigger of triggers) {
    // Check for "All Pages" type triggers without filters
    if (trigger.type === 'pageview' && (!trigger.filter || trigger.filter.length === 0)) {
      issues.push(
        createIssue(
          VALIDATION_CHECKS.BROAD_TRIGGER.code,
          VALIDATION_CHECKS.BROAD_TRIGGER.severity,
          VALIDATION_CHECKS.BROAD_TRIGGER.title,
          `Trigger "${trigger.name}" fires on all pages without specific conditions`,
          'Add page path or other conditions to prevent unnecessary tag firing',
          [trigger.name]
        )
      );
    }
  }

  return issues;
}

/**
 * Main validation function
 */
export function validateGTMContainer(
  container: GTMContainer,
  funnelEventNames: string[]
): GTMValidationResult {
  issueIdCounter = 0;
  const issues: ValidationIssue[] = [];

  // 1. Check all funnel events exist
  const tagEventNames = extractEventNamesFromTags(container);
  for (const event of funnelEventNames) {
    const eventLower = event.toLowerCase();
    if (!tagEventNames.some((t) => t.includes(eventLower) || eventLower.includes(t))) {
      issues.push(
        createIssue(
          VALIDATION_CHECKS.MISSING_EVENT.code,
          VALIDATION_CHECKS.MISSING_EVENT.severity,
          VALIDATION_CHECKS.MISSING_EVENT.title,
          `Funnel event "${event}" has no corresponding GTM tag`,
          `Create a tag for the "${event}" event`,
          [event]
        )
      );
    }
  }

  // 2. Check event values
  issues.push(...checkEventValues(container));

  // 3. Check event IDs for deduplication
  issues.push(...checkEventIdForDedup(container));

  // 4. Check data hashing
  issues.push(...checkDataHashing(container));

  // 5. Check Consent Mode
  issues.push(...checkConsentMode(container));

  // 6. Check CAPI tags
  issues.push(...checkCAPITags(container));

  // 7. Check trigger specificity
  issues.push(...checkTriggerSpecificity(container));

  // Detect match keys and calculate EMQ
  const detectedMatchKeys = detectMatchKeys(container);
  const matchKeysRecord = detectedMatchKeys.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as Record<string, boolean>
  );
  const emqEstimate = calculateEMQScore(matchKeysRecord);

  // Add warning if no match keys detected
  if (detectedMatchKeys.length === 0) {
    issues.push(
      createIssue(
        VALIDATION_CHECKS.NO_MATCH_KEYS.code,
        VALIDATION_CHECKS.NO_MATCH_KEYS.severity,
        VALIDATION_CHECKS.NO_MATCH_KEYS.title,
        'No user match keys detected in container',
        'Add variables to capture email, phone, click ID (fbc), and browser ID (fbp) for better ad matching'
      )
    );
  }

  const issueCount = {
    error: issues.filter((i) => i.severity === 'error').length,
    warning: issues.filter((i) => i.severity === 'warning').length,
    info: issues.filter((i) => i.severity === 'info').length,
  };

  return {
    isValid: issueCount.error === 0,
    containerName: container.containerVersion.container?.name || 'Unknown Container',
    containerVersion: String(container.exportFormatVersion),
    issueCount,
    issues,
    detectedMatchKeys,
    estimatedEMQ: emqEstimate.score,
    parsedAt: new Date().toISOString(),
  };
}

/**
 * Parses a GTM container JSON file
 */
export function parseGTMContainer(jsonString: string): GTMContainer | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.containerVersion && typeof parsed.exportFormatVersion === 'number') {
      return parsed as GTMContainer;
    }
    return null;
  } catch {
    return null;
  }
}
