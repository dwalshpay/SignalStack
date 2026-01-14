import type { FunnelStep } from '@/types';

export interface GA4AudienceDefinition {
  id: string;
  name: string;
  description: string;
  membershipDurationDays: number;
  filterClauses: GA4FilterClause[];
  exclusionClauses?: GA4FilterClause[];
}

export interface GA4FilterClause {
  type: 'event' | 'dimension' | 'metric';
  field: string;
  operator: string;
  value: string | number;
  scope?: 'within_same_session' | 'across_all_sessions';
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
 * Generate pre-configured GA4 audience definitions
 */
export function generateGA4Audiences(steps: FunnelStep[]): GA4AudienceDefinition[] {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const audiences: GA4AudienceDefinition[] = [];

  // 1. High Intent Audience
  audiences.push({
    id: 'high_intent',
    name: 'High Intent Visitors',
    description: 'Users who showed strong engagement signals: 60+ second sessions, 50%+ scroll depth, or visited pricing/demo pages',
    membershipDurationDays: 30,
    filterClauses: [
      {
        type: 'metric',
        field: 'engagement_time',
        operator: '>=',
        value: 60,
      },
    ],
  });

  // 2. Engaged Visitors
  audiences.push({
    id: 'engaged_visitors',
    name: 'Engaged Visitors',
    description: 'Users with 30+ second sessions and 2+ page views',
    membershipDurationDays: 30,
    filterClauses: [
      {
        type: 'metric',
        field: 'engagement_time',
        operator: '>=',
        value: 30,
      },
      {
        type: 'metric',
        field: 'screen_page_views',
        operator: '>=',
        value: 2,
      },
    ],
  });

  // 3. Low Quality Exclusion
  audiences.push({
    id: 'low_quality_exclude',
    name: 'Low Quality - Exclude',
    description: 'Users who bounced or had less than 10 second sessions. Use as exclusion audience.',
    membershipDurationDays: 30,
    filterClauses: [
      {
        type: 'metric',
        field: 'engagement_time',
        operator: '<',
        value: 10,
      },
    ],
  });

  // 4. Business Email Segment (if email captured event exists)
  const emailStep = sortedSteps.find(
    (s) => s.name.toLowerCase().includes('email') || s.eventName?.includes('email')
  );
  if (emailStep) {
    audiences.push({
      id: 'business_email',
      name: 'Business Email Leads',
      description: 'Users who submitted a business email address',
      membershipDurationDays: 90,
      filterClauses: [
        {
          type: 'event',
          field: emailStep.eventName || toEventName(emailStep.name),
          operator: 'exists',
          value: '',
        },
        {
          type: 'dimension',
          field: 'user_segment',
          operator: '==',
          value: 'business',
        },
      ],
    });
  }

  // 5. Funnel Stage Audiences (started but not completed next stage)
  for (let i = 0; i < sortedSteps.length - 1; i++) {
    const currentStep = sortedSteps[i];
    const nextStep = sortedSteps[i + 1];
    const currentEventName = currentStep.eventName || toEventName(currentStep.name);
    const nextEventName = nextStep.eventName || toEventName(nextStep.name);

    audiences.push({
      id: `funnel_${currentEventName}_not_${nextEventName}`,
      name: `${currentStep.name} - Did Not ${nextStep.name}`,
      description: `Users who completed ${currentStep.name} but have not yet completed ${nextStep.name}`,
      membershipDurationDays: 30,
      filterClauses: [
        {
          type: 'event',
          field: currentEventName,
          operator: 'exists',
          value: '',
        },
      ],
      exclusionClauses: [
        {
          type: 'event',
          field: nextEventName,
          operator: 'exists',
          value: '',
        },
      ],
    });
  }

  // 6. Bottom Funnel - Close to conversion
  if (sortedSteps.length >= 2) {
    const lastStep = sortedSteps[sortedSteps.length - 1];
    const secondLastStep = sortedSteps[sortedSteps.length - 2];

    audiences.push({
      id: 'bottom_funnel',
      name: 'Bottom Funnel - High Value',
      description: `Users who completed ${secondLastStep.name} - one step away from ${lastStep.name}`,
      membershipDurationDays: 60,
      filterClauses: [
        {
          type: 'event',
          field: secondLastStep.eventName || toEventName(secondLastStep.name),
          operator: 'exists',
          value: '',
        },
      ],
      exclusionClauses: [
        {
          type: 'event',
          field: lastStep.eventName || toEventName(lastStep.name),
          operator: 'exists',
          value: '',
        },
      ],
    });
  }

  return audiences;
}

/**
 * Generate GA4 Audience Builder UI instructions
 */
export function generateGA4AudienceInstructions(audience: GA4AudienceDefinition): string {
  let instructions = `## ${audience.name}

**Description:** ${audience.description}

**Membership Duration:** ${audience.membershipDurationDays} days

### Include Users When:
`;

  for (const clause of audience.filterClauses) {
    instructions += formatClauseInstruction(clause);
  }

  if (audience.exclusionClauses && audience.exclusionClauses.length > 0) {
    instructions += '\n### Exclude Users When:\n';
    for (const clause of audience.exclusionClauses) {
      instructions += formatClauseInstruction(clause);
    }
  }

  return instructions;
}

/**
 * Format a single filter clause as human-readable instruction
 */
function formatClauseInstruction(clause: GA4FilterClause): string {
  switch (clause.type) {
    case 'event':
      if (clause.operator === 'exists') {
        return `- Event: **${clause.field}** occurred\n`;
      }
      return `- Event: **${clause.field}** ${clause.operator} ${clause.value}\n`;

    case 'dimension':
      return `- Dimension: **${clause.field}** ${clause.operator} "${clause.value}"\n`;

    case 'metric':
      return `- Metric: **${clause.field}** ${clause.operator} ${clause.value}\n`;

    default:
      return '';
  }
}

/**
 * Export audience definitions as JSON for GA4 API
 */
export function exportGA4AudiencesJSON(audiences: GA4AudienceDefinition[]): string {
  return JSON.stringify(audiences, null, 2);
}

/**
 * Generate complete GA4 audience documentation
 */
export function generateGA4AudienceDocumentation(steps: FunnelStep[]): string {
  const audiences = generateGA4Audiences(steps);

  let doc = `# GA4 Audience Definitions for SignalStack

These audience definitions are optimized for value-based bidding and remarketing.

---

`;

  for (const audience of audiences) {
    doc += generateGA4AudienceInstructions(audience);
    doc += '\n---\n\n';
  }

  doc += `## How to Create These Audiences in GA4

1. Go to **Admin > Data display > Audiences**
2. Click **New audience**
3. Select **Create a custom audience**
4. Configure the conditions as specified above
5. Set the membership duration
6. Save and name the audience

### Best Practices

- **Exclusion audiences**: Use "Low Quality - Exclude" in your ad campaigns to prevent wasted spend
- **Funnel audiences**: Great for stage-specific remarketing with tailored messaging
- **Business email**: Prioritize these leads in your CRM and ad targeting
- **High intent**: Use higher bids for these users in Google Ads

### Audience Syncing

To use these audiences in Google Ads or Meta:
1. Link your GA4 property to Google Ads
2. Enable audience export to Google Ads
3. For Meta, export audience lists or use lookalike modeling based on your best converters`;

  return doc;
}
