import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ScoringRuleCard } from './ScoringRuleCard';
import { ScoringPreview } from './ScoringPreview';
import { useStore, useScoringRules } from '@/store/useStore';
import { DEFAULT_SCORING_RULES } from '@/lib/constants';
import {
  parseCondition,
  createCondition,
  CONDITION_OPERATORS,
  SCORING_FIELDS,
} from '@/lib/scoringCalculations';
import type { ScoringRule, ScoringCategory } from '@/types';

const CATEGORIES: { value: ScoringCategory; label: string }[] = [
  { value: 'firmographic', label: 'Firmographic' },
  { value: 'behavioural', label: 'Behavioural' },
  { value: 'engagement', label: 'Engagement' },
];

export const ScoringRuleBuilder: React.FC = () => {
  const rules = useScoringRules();
  const {
    addScoringRule,
    updateScoringRule,
    removeScoringRule,
    reorderScoringRules,
    toggleScoringRule,
    setScoringRules,
  } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScoringCategory>('firmographic');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = rules.findIndex((r) => r.id === active.id);
        const newIndex = rules.findIndex((r) => r.id === over.id);
        reorderScoringRules(oldIndex, newIndex);
      }
    },
    [rules, reorderScoringRules]
  );

  const handleAddRule = useCallback(
    (rule: Omit<ScoringRule, 'id'>) => {
      const newRule: ScoringRule = {
        ...rule,
        id: `rule-${Date.now()}`,
      };
      addScoringRule(newRule);
      setIsAdding(false);
    },
    [addScoringRule]
  );

  const handleEditRule = useCallback(
    (id: string, updates: Partial<ScoringRule>) => {
      updateScoringRule(id, updates);
      setEditingRuleId(null);
    },
    [updateScoringRule]
  );

  const handleLoadDefaults = useCallback(() => {
    if (window.confirm('This will replace your current rules with the default templates. Continue?')) {
      setScoringRules(DEFAULT_SCORING_RULES);
    }
  }, [setScoringRules]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to remove all scoring rules?')) {
      setScoringRules([]);
    }
  }, [setScoringRules]);

  // Filter rules by category for the tabbed view
  const rulesByCategory = {
    firmographic: rules.filter((r) => r.category === 'firmographic'),
    behavioural: rules.filter((r) => r.category === 'behavioural'),
    engagement: rules.filter((r) => r.category === 'engagement'),
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              + Add Rule
            </Button>
            <Button variant="outline" onClick={handleLoadDefaults}>
              Load Defaults
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{rules.length} rules</span>
            <span>•</span>
            <span>{rules.filter((r) => r.enabled).length} active</span>
            {rules.length > 0 && (
              <>
                <span>•</span>
                <button onClick={handleClearAll} className="text-red-600 hover:underline">
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Add Rule Form */}
      {isAdding && (
        <RuleForm
          onSubmit={handleAddRule}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedCategory === cat.value
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat.label}
              <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {rulesByCategory[cat.value].length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Rules List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rulesByCategory[selectedCategory].map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {rulesByCategory[selectedCategory].length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {selectedCategory} rules configured.{' '}
                <button
                  onClick={() => setIsAdding(true)}
                  className="text-primary-600 hover:underline"
                >
                  Add one
                </button>
              </div>
            ) : (
              rulesByCategory[selectedCategory].map((rule) =>
                editingRuleId === rule.id ? (
                  <RuleForm
                    key={rule.id}
                    rule={rule}
                    onSubmit={(updates) => handleEditRule(rule.id, updates as Partial<ScoringRule>)}
                    onCancel={() => setEditingRuleId(null)}
                  />
                ) : (
                  <ScoringRuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={() => toggleScoringRule(rule.id)}
                    onEdit={() => setEditingRuleId(rule.id)}
                    onDelete={() => removeScoringRule(rule.id)}
                  />
                )
              )
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Preview */}
      <ScoringPreview rules={rules} />
    </div>
  );
};

// Rule Form Component
interface RuleFormProps {
  rule?: ScoringRule;
  onSubmit: (rule: Omit<ScoringRule, 'id'>) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSubmit, onCancel }) => {
  const [category, setCategory] = useState<ScoringCategory>(rule?.category || 'firmographic');
  const [field, setField] = useState(rule?.field || '');
  const [customField, setCustomField] = useState('');
  const [operator, setOperator] = useState(
    rule ? parseCondition(rule.condition).operator : 'equals'
  );
  const [conditionValue, setConditionValue] = useState(
    rule ? parseCondition(rule.condition).value : ''
  );
  const [points, setPoints] = useState(rule?.points ?? 10);
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);

  const selectedOperator = CONDITION_OPERATORS.find((o) => o.value === operator);
  const fields = SCORING_FIELDS[category];
  const isCustomField = field === '__custom__';
  const actualField = isCustomField ? customField : field;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualField) return;

    const condition = createCondition(operator, conditionValue);
    onSubmit({
      category,
      field: actualField,
      condition,
      points,
      enabled,
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ScoringCategory);
                setField('');
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a field...</option>
              {fields.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
              <option value="__custom__">Custom field...</option>
            </select>
          </div>
        </div>

        {isCustomField && (
          <Input
            label="Custom Field Name"
            value={customField}
            onChange={(e) => setCustomField(e.target.value)}
            placeholder="e.g., utm_campaign"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {CONDITION_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {selectedOperator?.requiresValue && (
            <Input
              label="Value"
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              placeholder={operator === 'in_list' ? 'value1, value2, value3' : 'Enter value...'}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Points"
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            hint="Positive adds points, negative subtracts"
          />

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="enabled" className="text-sm text-gray-700">
              Enable this rule
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!actualField}>
            {rule ? 'Update Rule' : 'Add Rule'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
