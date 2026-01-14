import type { ScoringRule, ScoringResult } from '@/types';
import { SCORING } from './constants';

const { minMultiplier, maxMultiplier, maxScore } = SCORING;

/**
 * Evaluates a single scoring rule condition against lead data
 */
function evaluateCondition(rule: ScoringRule, data: Record<string, unknown>): boolean {
  const value = data[rule.field];
  const [operator, ...valueParts] = rule.condition.split(':');
  const conditionValue = valueParts.join(':');

  switch (operator) {
    case 'equals':
      return String(value).toLowerCase() === conditionValue.toLowerCase();

    case 'not_equals':
      return String(value).toLowerCase() !== conditionValue.toLowerCase();

    case 'contains':
      return String(value).toLowerCase().includes(conditionValue.toLowerCase());

    case 'not_contains':
      return !String(value).toLowerCase().includes(conditionValue.toLowerCase());

    case 'greater_than':
      return Number(value) > Number(conditionValue);

    case 'less_than':
      return Number(value) < Number(conditionValue);

    case 'greater_than_or_equal':
      return Number(value) >= Number(conditionValue);

    case 'less_than_or_equal':
      return Number(value) <= Number(conditionValue);

    case 'in_list':
      const listItems = conditionValue.split(',').map((s) => s.trim().toLowerCase());
      return listItems.includes(String(value).toLowerCase());

    case 'not_in_list':
      const excludeItems = conditionValue.split(',').map((s) => s.trim().toLowerCase());
      return !excludeItems.includes(String(value).toLowerCase());

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

/**
 * Calculates the lead scoring result based on rules and lead data
 */
export function calculateScoringResult(
  rules: ScoringRule[],
  leadData: Record<string, unknown>
): ScoringResult {
  const enabledRules = rules.filter((r) => r.enabled);
  let totalPoints = 0;
  const appliedRules: { ruleId: string; points: number }[] = [];

  for (const rule of enabledRules) {
    if (evaluateCondition(rule, leadData)) {
      totalPoints += rule.points;
      appliedRules.push({ ruleId: rule.id, points: rule.points });
    }
  }

  // Clamp to 0-100
  const normalizedScore = Math.max(0, Math.min(totalPoints, maxScore));

  // Multiplier formula: 0.1 + (normalizedScore / 100) * 1.9
  const multiplier =
    minMultiplier + (normalizedScore / maxScore) * (maxMultiplier - minMultiplier);

  return {
    totalPoints,
    normalizedScore,
    multiplier: Math.round(multiplier * 100) / 100,
    appliedRules,
  };
}

/**
 * Calculates the multiplier for a given score
 */
export function scoreToMultiplier(score: number): number {
  const normalizedScore = Math.max(0, Math.min(score, maxScore));
  const multiplier =
    minMultiplier + (normalizedScore / maxScore) * (maxMultiplier - minMultiplier);
  return Math.round(multiplier * 100) / 100;
}

/**
 * Calculates the score range that produces a given multiplier
 */
export function multiplierToScoreRange(multiplier: number): { min: number; max: number } {
  // Inverse of the formula
  const score = ((multiplier - minMultiplier) / (maxMultiplier - minMultiplier)) * maxScore;
  return {
    min: Math.max(0, Math.floor(score)),
    max: Math.min(maxScore, Math.ceil(score)),
  };
}

/**
 * Gets the maximum possible score from enabled rules
 */
export function getMaxPossibleScore(rules: ScoringRule[]): number {
  return rules.filter((r) => r.enabled).reduce((sum, rule) => sum + rule.points, 0);
}

/**
 * Formats a condition for display
 */
export function formatCondition(condition: string): string {
  const [operator, ...valueParts] = condition.split(':');
  const value = valueParts.join(':');

  const operatorLabels: Record<string, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    greater_than: 'is greater than',
    less_than: 'is less than',
    greater_than_or_equal: 'is at least',
    less_than_or_equal: 'is at most',
    in_list: 'is one of',
    not_in_list: 'is not one of',
    is_true: 'is true',
    is_false: 'is false',
    exists: 'exists',
    not_exists: 'does not exist',
  };

  const label = operatorLabels[operator] || operator;

  if (['is_true', 'is_false', 'exists', 'not_exists'].includes(operator)) {
    return label;
  }

  return `${label} "${value}"`;
}

/**
 * Parses a condition string into operator and value
 */
export function parseCondition(condition: string): { operator: string; value: string } {
  const [operator, ...valueParts] = condition.split(':');
  return {
    operator,
    value: valueParts.join(':'),
  };
}

/**
 * Creates a condition string from operator and value
 */
export function createCondition(operator: string, value: string): string {
  if (['is_true', 'is_false', 'exists', 'not_exists'].includes(operator)) {
    return operator;
  }
  return `${operator}:${value}`;
}

/**
 * Available operators for scoring rules
 */
export const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals', requiresValue: true },
  { value: 'not_equals', label: 'Does not equal', requiresValue: true },
  { value: 'contains', label: 'Contains', requiresValue: true },
  { value: 'not_contains', label: 'Does not contain', requiresValue: true },
  { value: 'greater_than', label: 'Greater than', requiresValue: true },
  { value: 'less_than', label: 'Less than', requiresValue: true },
  { value: 'in_list', label: 'Is one of (comma-separated)', requiresValue: true },
  { value: 'not_in_list', label: 'Is not one of (comma-separated)', requiresValue: true },
  { value: 'is_true', label: 'Is true', requiresValue: false },
  { value: 'is_false', label: 'Is false', requiresValue: false },
  { value: 'exists', label: 'Exists', requiresValue: false },
  { value: 'not_exists', label: 'Does not exist', requiresValue: false },
];

/**
 * Common fields for scoring rules by category
 */
export const SCORING_FIELDS = {
  firmographic: [
    { value: 'email_type', label: 'Email Type' },
    { value: 'company_size', label: 'Company Size' },
    { value: 'industry', label: 'Industry' },
    { value: 'job_title', label: 'Job Title' },
    { value: 'company_revenue', label: 'Company Revenue' },
  ],
  behavioural: [
    { value: 'page_path', label: 'Page Path' },
    { value: 'session_count', label: 'Session Count' },
    { value: 'time_on_site', label: 'Time on Site (seconds)' },
    { value: 'pages_viewed', label: 'Pages Viewed' },
    { value: 'scroll_depth', label: 'Scroll Depth (%)' },
  ],
  engagement: [
    { value: 'form_type', label: 'Form Type' },
    { value: 'content_download', label: 'Content Download' },
    { value: 'cta_clicked', label: 'CTA Clicked' },
    { value: 'email_opened', label: 'Email Opened' },
    { value: 'video_watched', label: 'Video Watched' },
  ],
};
