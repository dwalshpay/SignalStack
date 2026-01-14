import React from 'react';
import type { ValidationIssue } from '@/types';

interface ValidationResultCardProps {
  issue: ValidationIssue;
}

export const ValidationResultCard: React.FC<ValidationResultCardProps> = ({ issue }) => {
  const severityConfig = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '✕',
      iconBg: 'bg-red-100 text-red-600',
      title: 'text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: '!',
      iconBg: 'bg-yellow-100 text-yellow-600',
      title: 'text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'i',
      iconBg: 'bg-blue-100 text-blue-600',
      title: 'text-blue-800',
    },
  };

  const config = severityConfig[issue.severity];

  return (
    <div className={`rounded-lg border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${config.iconBg}`}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${config.title}`}>{issue.title}</h4>
          <p className="text-sm text-gray-700 mt-1">{issue.description}</p>

          {issue.affectedItems && issue.affectedItems.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Affected: </span>
              {issue.affectedItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-block text-xs bg-white/50 px-1.5 py-0.5 rounded mr-1 text-gray-700"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Recommendation: </span>
            <span className="text-gray-600">{issue.recommendation}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
