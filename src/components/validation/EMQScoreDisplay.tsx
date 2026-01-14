import React from 'react';
import type { EMQEstimate } from '@/types';
import { getEMQRatingColor, getEMQRatingBgColor } from '@/lib/emqCalculator';

interface EMQScoreDisplayProps {
  estimate: EMQEstimate;
  size?: 'sm' | 'md' | 'lg';
}

export const EMQScoreDisplay: React.FC<EMQScoreDisplayProps> = ({
  estimate,
  size = 'md'
}) => {
  const { score, maxScore, rating } = estimate;
  const percentage = (score / maxScore) * 100;

  const sizeClasses = {
    sm: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-base' },
  };

  const ratingLabels = {
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Circular gauge */}
      <div className={`relative ${sizeClasses[size].container}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={rating === 'poor' ? '#ef4444' : rating === 'fair' ? '#eab308' : rating === 'good' ? '#3b82f6' : '#22c55e'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
            className="transition-all duration-500"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${sizeClasses[size].text} ${getEMQRatingColor(rating)}`}>
            {score.toFixed(1)}
          </span>
          <span className={`text-gray-500 ${sizeClasses[size].label}`}>
            / {maxScore}
          </span>
        </div>
      </div>

      {/* Rating badge */}
      <div className={`mt-3 px-3 py-1 rounded-full ${getEMQRatingBgColor(rating)}`}>
        <span className={`font-medium ${sizeClasses[size].label} ${getEMQRatingColor(rating)}`}>
          {ratingLabels[rating]}
        </span>
      </div>
    </div>
  );
};
