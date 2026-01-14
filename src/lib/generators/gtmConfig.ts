import type { FunnelStep, CalculatedValue } from '@/types';

export interface GTMInstruction {
  stepNumber: number;
  title: string;
  type: 'variable' | 'trigger' | 'tag' | 'setup';
  platform?: 'google' | 'meta' | 'ga4';
  content: string;
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
 * Generate complete GTM configuration guide
 */
export function generateGTMInstructions(
  steps: FunnelStep[],
  values: CalculatedValue[],
  currency: string,
  googleAdsId: string = 'AW-XXXXXXXXX',
  metaPixelId: string = 'XXXXXXXXXX',
  ga4MeasurementId: string = 'G-XXXXXXXXXX'
): GTMInstruction[] {
  const instructions: GTMInstruction[] = [];
  let stepNum = 0;

  // Initial setup instructions
  instructions.push({
    stepNumber: ++stepNum,
    title: 'Enable Consent Mode v2',
    type: 'setup',
    content: `## Consent Mode v2 Setup

Before implementing conversion tracking, ensure Consent Mode v2 is properly configured.

### In GTM:
1. Go to **Admin > Container Settings**
2. Enable **"Enable consent overview"**

### Add Consent Initialization Tag:
- Tag Type: **Consent Initialization**
- Set default consent state:
  - \`ad_storage\`: denied
  - \`analytics_storage\`: denied
  - \`ad_user_data\`: denied
  - \`ad_personalization\`: denied

### Update Consent on User Choice:
Create a Custom HTML tag that fires when user grants consent:

\`\`\`javascript
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
\`\`\`

Trigger: When user accepts cookies/consent.`,
  });

  // Data Layer Variables
  instructions.push({
    stepNumber: ++stepNum,
    title: 'Create Data Layer Variables',
    type: 'variable',
    content: `## Data Layer Variables

Create these variables in GTM to read values from the data layer.

### 1. Event Value Variable
- **Name**: DLV - event_value
- **Type**: Data Layer Variable
- **Variable Name**: event_value

### 2. Event ID Variable (for deduplication)
- **Name**: DLV - event_id
- **Type**: Data Layer Variable
- **Variable Name**: event_id

### 3. Currency Variable
- **Name**: DLV - currency
- **Type**: Data Layer Variable
- **Variable Name**: currency
- **Default Value**: ${currency}

### 4. User Segment Variable
- **Name**: DLV - user_segment
- **Type**: Data Layer Variable
- **Variable Name**: user_data.user_segment

### 5. Hashed Email Variable
- **Name**: DLV - email_hash
- **Type**: Data Layer Variable
- **Variable Name**: user_data.email_hash`,
  });

  // Create triggers for each funnel step
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  instructions.push({
    stepNumber: ++stepNum,
    title: 'Create Custom Event Triggers',
    type: 'trigger',
    content: `## Custom Event Triggers

Create a trigger for each conversion event.

${sortedSteps
  .map((step, i) => {
    const eventName = step.eventName || toEventName(step.name);
    return `### ${i + 1}. ${step.name} Trigger
- **Name**: CE - ${eventName}
- **Type**: Custom Event
- **Event Name**: ${eventName}
- **Fires on**: All Custom Events`;
  })
  .join('\n\n')}`,
  });

  // Google Ads Conversion Tags
  instructions.push({
    stepNumber: ++stepNum,
    title: 'Google Ads Conversion Tags',
    type: 'tag',
    platform: 'google',
    content: `## Google Ads Conversion Tags

Create a conversion tag for each funnel event.

**Prerequisites:**
- Google Ads Conversion Tracking ID: \`${googleAdsId}\`
- Conversion Labels from Google Ads (create conversions in Google Ads first)

${sortedSteps
  .map((step, i) => {
    const value = values.find((v) => v.stepId === step.id);
    const eventName = step.eventName || toEventName(step.name);
    const baseValue = value?.baseValue ?? 0;

    return `### ${i + 1}. ${step.name} Conversion
- **Tag Name**: GAds - ${eventName}
- **Tag Type**: Google Ads Conversion Tracking
- **Conversion ID**: ${googleAdsId.replace('AW-', '')}
- **Conversion Label**: (from Google Ads)
- **Conversion Value**: {{DLV - event_value}} or ${baseValue.toFixed(2)}
- **Currency Code**: {{DLV - currency}}
- **Transaction ID**: {{DLV - event_id}}
- **Trigger**: CE - ${eventName}`;
  })
  .join('\n\n')}`,
  });

  // Meta Pixel Tags
  instructions.push({
    stepNumber: ++stepNum,
    title: 'Meta Pixel Tags',
    type: 'tag',
    platform: 'meta',
    content: `## Meta Pixel Tags

Create Meta Pixel tags for each funnel event with event_id for deduplication.

**Prerequisites:**
- Meta Pixel ID: \`${metaPixelId}\`
- Meta Pixel base code installed (or use GTM template)

### Base Pixel Installation
If not already installed, add the Meta Pixel base code tag:
- **Tag Type**: Custom HTML or Meta Pixel template
- **Trigger**: All Pages

${sortedSteps
  .map((step, i) => {
    const value = values.find((v) => v.stepId === step.id);
    const eventName = step.eventName || toEventName(step.name);
    const baseValue = value?.baseValue ?? 0;
    const metaEvent = mapToMetaEvent(eventName);

    return `### ${i + 1}. ${step.name} Event
- **Tag Name**: Meta - ${eventName}
- **Tag Type**: Custom HTML

\`\`\`html
<script>
  fbq('track', '${metaEvent}', {
    value: {{DLV - event_value}} || ${baseValue.toFixed(2)},
    currency: '${currency}'
  }, {
    eventID: '{{DLV - event_id}}'
  });
</script>
\`\`\`

- **Trigger**: CE - ${eventName}

**Important**: The \`eventID\` parameter is critical for deduplication with server-side events (CAPI).`;
  })
  .join('\n\n')}`,
  });

  // GA4 Event Tags
  instructions.push({
    stepNumber: ++stepNum,
    title: 'GA4 Event Tags',
    type: 'tag',
    platform: 'ga4',
    content: `## GA4 Event Tags

Create GA4 event tags for each funnel event.

**Prerequisites:**
- GA4 Measurement ID: \`${ga4MeasurementId}\`
- GA4 Configuration tag already firing on all pages

${sortedSteps
  .map((step, i) => {
    const eventName = step.eventName || toEventName(step.name);

    return `### ${i + 1}. ${step.name} Event
- **Tag Name**: GA4 - ${eventName}
- **Tag Type**: GA4 Event
- **Configuration Tag**: Your GA4 Config tag
- **Event Name**: ${eventName}
- **Event Parameters**:
  | Parameter | Value |
  |-----------|-------|
  | value | {{DLV - event_value}} |
  | currency | ${currency} |
  | transaction_id | {{DLV - event_id}} |
  | user_segment | {{DLV - user_segment}} |
- **Trigger**: CE - ${eventName}`;
  })
  .join('\n\n')}`,
  });

  // Testing instructions
  instructions.push({
    stepNumber: ++stepNum,
    title: 'Testing Your Implementation',
    type: 'setup',
    content: `## Testing Checklist

### GTM Preview Mode
1. Click **Preview** in GTM
2. Navigate to your website
3. Trigger each conversion event
4. Verify in the debug panel:
   - Correct trigger fires
   - Data layer values populate correctly
   - Tags fire in the correct order

### Platform-Specific Testing

#### Google Ads
- Use **Google Tag Assistant** Chrome extension
- Check for conversion events in Google Ads > Tools > Conversions
- Allow 24-48 hours for conversions to appear

#### Meta Pixel
- Use **Meta Pixel Helper** Chrome extension
- Verify events in Meta Events Manager > Test Events
- Check event_id is present for deduplication

#### GA4
- Use **GA4 DebugView** (Realtime > DebugView)
- Enable debug mode: Add \`?debug_mode=true\` to URL
- Verify event parameters are correct

### Common Issues

1. **Events not firing**
   - Check trigger conditions match exactly
   - Verify data layer push happens before tag fires

2. **Missing values**
   - Confirm data layer variable names match exactly
   - Check for typos in variable configuration

3. **Duplicate conversions**
   - Ensure event_id is unique per conversion
   - Verify deduplication is working with CAPI`,
  });

  return instructions;
}

/**
 * Map funnel event names to Meta event names
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
 * Generate markdown version of GTM instructions
 */
export function generateGTMMarkdown(instructions: GTMInstruction[]): string {
  return instructions.map((inst) => inst.content).join('\n\n---\n\n');
}
