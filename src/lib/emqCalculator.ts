import type { EMQMatchKey, EMQEstimate, EMQRating } from '@/types';
import { EMQ_WEIGHTS, EMQ_BASE_SCORE, EMQ_MAX_SCORE } from './constants';

/**
 * Formats a match key identifier into a readable label
 */
function formatKeyLabel(key: string): string {
  return EMQ_WEIGHTS[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Determines EMQ rating based on score
 */
function getEMQRating(score: number): EMQRating {
  if (score < 5) return 'poor';
  if (score < 7) return 'fair';
  if (score < 9) return 'good';
  return 'excellent';
}

/**
 * Calculates EMQ score based on available match keys
 * @param availableKeys - Record of match key availability (key -> boolean)
 * @returns EMQ estimate with score, max score, match keys, and rating
 */
export function calculateEMQScore(availableKeys: Record<string, boolean>): EMQEstimate {
  let additionalScore = 0;
  const matchKeys: EMQMatchKey[] = [];

  for (const [key, config] of Object.entries(EMQ_WEIGHTS)) {
    const available = availableKeys[key] || false;
    matchKeys.push({
      key,
      label: formatKeyLabel(key),
      weight: config.weight,
      available,
    });
    if (available) {
      additionalScore += config.weight;
    }
  }

  // Sort by weight descending
  matchKeys.sort((a, b) => b.weight - a.weight);

  const score = Math.min(EMQ_BASE_SCORE + additionalScore, EMQ_MAX_SCORE);
  const rating = getEMQRating(score);

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    maxScore: EMQ_MAX_SCORE,
    matchKeys,
    rating,
  };
}

/**
 * Gets recommendations for improving EMQ score
 */
export function getEMQRecommendations(estimate: EMQEstimate): string[] {
  const recommendations: string[] = [];
  const unavailableKeys = estimate.matchKeys.filter((k) => !k.available);

  // Prioritize by weight
  for (const key of unavailableKeys.slice(0, 3)) {
    switch (key.key) {
      case 'email':
        recommendations.push('Capture and hash email addresses for the highest EMQ impact (+2.5)');
        break;
      case 'fbc':
        recommendations.push('Ensure Facebook Click ID (fbc) is passed from URL parameters (+2.0)');
        break;
      case 'phone':
        recommendations.push('Collect and hash phone numbers when available (+1.5)');
        break;
      case 'fbp':
        recommendations.push('Enable Facebook Browser ID (fbp) cookie tracking (+1.0)');
        break;
      case 'external_id':
        recommendations.push('Pass a consistent external user ID for cross-device matching (+0.8)');
        break;
      default:
        recommendations.push(`Consider collecting ${key.label.toLowerCase()} (+${key.weight})`);
    }
  }

  if (estimate.rating === 'poor') {
    recommendations.push('Your EMQ is below optimal. Focus on capturing email and click ID first.');
  } else if (estimate.rating === 'fair') {
    recommendations.push('Good progress! Adding phone and browser ID will significantly improve matching.');
  }

  return recommendations;
}

/**
 * Gets the color class for EMQ rating
 */
export function getEMQRatingColor(rating: EMQRating): string {
  switch (rating) {
    case 'poor':
      return 'text-red-600';
    case 'fair':
      return 'text-yellow-600';
    case 'good':
      return 'text-blue-600';
    case 'excellent':
      return 'text-green-600';
  }
}

/**
 * Gets the background color class for EMQ rating
 */
export function getEMQRatingBgColor(rating: EMQRating): string {
  switch (rating) {
    case 'poor':
      return 'bg-red-100';
    case 'fair':
      return 'bg-yellow-100';
    case 'good':
      return 'bg-blue-100';
    case 'excellent':
      return 'bg-green-100';
  }
}
