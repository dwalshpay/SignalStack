import type { ScoringRule as PrismaScoringRule } from '@prisma/client';

// Constants from frontend
const SCORING = {
  minMultiplier: 0.1,
  maxMultiplier: 2.0,
  maxScore: 100,
};

export interface ScoringResult {
  totalPoints: number;
  normalizedScore: number;
  multiplier: number;
  appliedRules: { ruleId: string; field: string; points: number }[];
}

/**
 * Evaluates a single scoring rule condition against lead data
 */
function evaluateCondition(
  field: string,
  condition: string,
  data: Record<string, unknown>
): boolean {
  const value = data[field];
  const [operator, ...valueParts] = condition.split(':');
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

    case 'in_list': {
      const listItems = conditionValue.split(',').map((s) => s.trim().toLowerCase());
      return listItems.includes(String(value).toLowerCase());
    }

    case 'not_in_list': {
      const excludeItems = conditionValue.split(',').map((s) => s.trim().toLowerCase());
      return !excludeItems.includes(String(value).toLowerCase());
    }

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
 * Ported from frontend: /src/lib/scoringCalculations.ts
 */
export function calculateScoringResult(
  rules: PrismaScoringRule[],
  leadData: Record<string, unknown>
): ScoringResult {
  const enabledRules = rules.filter((r) => r.enabled);
  let totalPoints = 0;
  const appliedRules: { ruleId: string; field: string; points: number }[] = [];

  for (const rule of enabledRules) {
    if (evaluateCondition(rule.field, rule.condition, leadData)) {
      totalPoints += rule.points;
      appliedRules.push({
        ruleId: rule.id,
        field: rule.field,
        points: rule.points,
      });
    }
  }

  // Clamp to 0-100
  const normalizedScore = Math.max(0, Math.min(totalPoints, SCORING.maxScore));

  // Multiplier formula: 0.1 + (normalizedScore / 100) * 1.9
  const multiplier =
    SCORING.minMultiplier +
    (normalizedScore / SCORING.maxScore) * (SCORING.maxMultiplier - SCORING.minMultiplier);

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
  const normalizedScore = Math.max(0, Math.min(score, SCORING.maxScore));
  const multiplier =
    SCORING.minMultiplier +
    (normalizedScore / SCORING.maxScore) * (SCORING.maxMultiplier - SCORING.minMultiplier);
  return Math.round(multiplier * 100) / 100;
}
