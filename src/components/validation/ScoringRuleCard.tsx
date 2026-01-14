import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ScoringRule, ScoringCategory } from '@/types';
import { formatCondition } from '@/lib/scoringCalculations';

interface ScoringRuleCardProps {
  rule: ScoringRule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryLabels: Record<ScoringCategory, string> = {
  firmographic: 'Firmographic',
  behavioural: 'Behavioural',
  engagement: 'Engagement',
};

const categoryColors: Record<ScoringCategory, string> = {
  firmographic: 'bg-purple-100 text-purple-700',
  behavioural: 'bg-blue-100 text-blue-700',
  engagement: 'bg-green-100 text-green-700',
};

export const ScoringRuleCard: React.FC<ScoringRuleCardProps> = ({
  rule,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 ${
        isDragging ? 'shadow-lg ring-2 ring-primary-500' : 'shadow-sm'
      } ${!rule.enabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4h2v2H4V4zm6 0h2v2h-2V4zM4 7h2v2H4V7zm6 0h2v2h-2V7zM4 10h2v2H4v-2zm6 0h2v2h-2v-2z" />
          </svg>
        </button>

        {/* Toggle */}
        <button
          onClick={onToggle}
          className={`w-10 h-5 rounded-full relative transition-colors ${
            rule.enabled ? 'bg-primary-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[rule.category]}`}>
              {categoryLabels[rule.category]}
            </span>
            <span className="font-medium text-gray-900">{rule.field}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5 truncate">
            {formatCondition(rule.condition)}
          </p>
        </div>

        {/* Points */}
        <div className="text-right">
          <span
            className={`text-lg font-bold ${rule.points >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {rule.points >= 0 ? '+' : ''}
            {rule.points}
          </span>
          <p className="text-xs text-gray-500">points</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Edit rule"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete rule"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
