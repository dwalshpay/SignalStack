import type { ScoringRule } from '@/types';
import { SCORING } from '../constants';

/**
 * Generates a GTM Custom JavaScript Variable template for lead scoring
 */
export function generateGTMScoringVariable(rules: ScoringRule[]): string {
  const enabledRules = rules.filter((r) => r.enabled);

  const rulesJson = JSON.stringify(
    enabledRules.map((r) => ({
      field: r.field,
      condition: r.condition,
      points: r.points,
      category: r.category,
    })),
    null,
    2
  );

  return `// SignalStack Lead Scoring Variable
// Paste this as a Custom JavaScript Variable in GTM

function() {
  // Scoring configuration
  var rules = ${rulesJson};

  var MIN_MULTIPLIER = ${SCORING.minMultiplier};
  var MAX_MULTIPLIER = ${SCORING.maxMultiplier};
  var MAX_SCORE = ${SCORING.maxScore};

  // Helper: Get data from various sources
  function getData(field) {
    // Check dataLayer
    var dlValue = {{DL - ${enabledRules[0]?.field || 'user_data'}}};
    if (dlValue && dlValue[field] !== undefined) {
      return dlValue[field];
    }

    // Check URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(field)) {
      return urlParams.get(field);
    }

    // Check cookies
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(field + '=') === 0) {
        return cookie.substring(field.length + 1);
      }
    }

    // Check sessionStorage
    try {
      var sessionValue = sessionStorage.getItem(field);
      if (sessionValue) return sessionValue;
    } catch (e) {}

    return undefined;
  }

  // Helper: Evaluate a condition
  function evaluateCondition(rule, value) {
    var parts = rule.condition.split(':');
    var operator = parts[0];
    var condValue = parts.slice(1).join(':');

    switch (operator) {
      case 'equals':
        return String(value).toLowerCase() === condValue.toLowerCase();
      case 'not_equals':
        return String(value).toLowerCase() !== condValue.toLowerCase();
      case 'contains':
        return String(value).toLowerCase().indexOf(condValue.toLowerCase()) !== -1;
      case 'not_contains':
        return String(value).toLowerCase().indexOf(condValue.toLowerCase()) === -1;
      case 'greater_than':
        return Number(value) > Number(condValue);
      case 'less_than':
        return Number(value) < Number(condValue);
      case 'in_list':
        var list = condValue.split(',').map(function(s) { return s.trim().toLowerCase(); });
        return list.indexOf(String(value).toLowerCase()) !== -1;
      case 'not_in_list':
        var exList = condValue.split(',').map(function(s) { return s.trim().toLowerCase(); });
        return exList.indexOf(String(value).toLowerCase()) === -1;
      case 'is_true':
        return value === true || value === 'true' || value === '1';
      case 'is_false':
        return value === false || value === 'false' || value === '0';
      case 'exists':
        return value !== undefined && value !== null && value !== '';
      case 'not_exists':
        return value === undefined || value === null || value === '';
      default:
        return false;
    }
  }

  // Calculate score
  var totalPoints = 0;
  var appliedRules = [];

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    var value = getData(rule.field);

    if (evaluateCondition(rule, value)) {
      totalPoints += rule.points;
      appliedRules.push({
        field: rule.field,
        points: rule.points,
        category: rule.category
      });
    }
  }

  // Normalize score and calculate multiplier
  var normalizedScore = Math.max(0, Math.min(totalPoints, MAX_SCORE));
  var multiplier = MIN_MULTIPLIER + (normalizedScore / MAX_SCORE) * (MAX_MULTIPLIER - MIN_MULTIPLIER);
  multiplier = Math.round(multiplier * 100) / 100;

  return {
    score: normalizedScore,
    multiplier: multiplier,
    appliedRules: appliedRules,
    totalPoints: totalPoints
  };
}`;
}

/**
 * Generates dataLayer push code for lead scoring events
 */
export function generateDataLayerPush(rules: ScoringRule[]): string {
  const enabledRules = rules.filter((r) => r.enabled);

  return `// SignalStack Lead Scoring - DataLayer Integration
// Add this to your page after calculating the lead score

// Option 1: Push to dataLayer after form submission
function pushLeadScore(leadData) {
  // leadData should contain the fields used in your scoring rules
  // Example: { email_type: 'business', company_size: 250, page_path: '/pricing' }

  var scoringResult = calculateLeadScore(leadData);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_scored',
    lead_score: scoringResult.score,
    lead_multiplier: scoringResult.multiplier,
    score_signals: {
${enabledRules
  .map((r) => `      ${r.field}: leadData.${r.field} || null`)
  .join(',\n')}
    },
    applied_rules: scoringResult.appliedRules.length
  });
}

// Option 2: Use with GTM Custom Event trigger
// Create a trigger that fires on 'lead_scored' event
// Then use the lead_score and lead_multiplier in your conversion tags

// Example: Adjust conversion value based on score
function getAdjustedConversionValue(baseValue) {
  var leadData = window.dataLayer.find(function(item) {
    return item.event === 'lead_scored';
  });

  if (leadData && leadData.lead_multiplier) {
    return Math.round(baseValue * leadData.lead_multiplier * 100) / 100;
  }

  return baseValue;
}

// Example usage:
// var adjustedValue = getAdjustedConversionValue(${100}); // Base value
// Use adjustedValue in your conversion tag`;
}

/**
 * Generates a complete GTM tag configuration guide for lead scoring
 */
export function generateGTMTagGuide(): string {
  return `# GTM Lead Scoring Implementation Guide

## Step 1: Create the Scoring Variable

1. Go to GTM > Variables > New
2. Choose "Custom JavaScript"
3. Paste the scoring variable code
4. Name it "CJS - Lead Score"
5. Save

## Step 2: Create Data Layer Variables

For each field used in your scoring rules, create a Data Layer Variable:

1. Go to Variables > New
2. Choose "Data Layer Variable"
3. Set the variable name (e.g., "email_type", "company_size")
4. Save

## Step 3: Create the Scoring Trigger

1. Go to Triggers > New
2. Choose "Custom Event"
3. Event name: \`form_submit\` or your form submission event
4. Save

## Step 4: Create the Lead Score Tag

1. Go to Tags > New
2. Choose "Custom HTML"
3. Paste the dataLayer push code
4. Fire on your form submission trigger
5. Save

## Step 5: Update Conversion Tags

In your Google Ads or Meta conversion tags:

1. Use the variable \`{{CJS - Lead Score}}.multiplier\` to adjust values
2. Or access \`{{DL - lead_multiplier}}\` after the lead_scored event

### Google Ads Example
- Conversion Value: \`{{Base Value}} * {{CJS - Lead Score}}.multiplier\`

### Meta CAPI Example
Add to custom_data:
\`\`\`json
{
  "lead_score": "{{CJS - Lead Score}}.score",
  "value": "{{Base Value}} * {{CJS - Lead Score}}.multiplier"
}
\`\`\`

## Step 6: Test

1. Use GTM Preview mode
2. Submit a test form
3. Verify the lead_scored event fires
4. Check that multiplier is applied correctly`;
}

/**
 * Generates a complete scoring implementation bundle
 */
export function generateScoringBundle(rules: ScoringRule[]): {
  variable: string;
  dataLayer: string;
  guide: string;
} {
  return {
    variable: generateGTMScoringVariable(rules),
    dataLayer: generateDataLayerPush(rules),
    guide: generateGTMTagGuide(),
  };
}
