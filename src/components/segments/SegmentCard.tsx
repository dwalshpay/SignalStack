import React, { useState, useCallback } from 'react';
import { Button, Input, Select } from '@/components/common';
import type { AudienceSegment, IdentificationRule } from '@/types';

interface SegmentCardProps {
  segment: AudienceSegment;
  onUpdate: (updates: Partial<AudienceSegment>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ruleTypeOptions = [
  { value: 'email_domain', label: 'Email Domain' },
  { value: 'form_field', label: 'Form Field' },
  { value: 'behaviour', label: 'Behaviour' }
];

const conditionOptions = [
  { value: 'not_in_blocklist', label: 'Not in blocklist (Business)' },
  { value: 'in_blocklist', label: 'In blocklist (Consumer)' }
];

export const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: segment.name,
    multiplier: segment.multiplier,
    ruleType: segment.identificationRule.type,
    condition: segment.identificationRule.condition
  });

  const handleEdit = useCallback(() => {
    setEditValues({
      name: segment.name,
      multiplier: segment.multiplier,
      ruleType: segment.identificationRule.type,
      condition: segment.identificationRule.condition
    });
    setIsEditing(true);
  }, [segment]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    onUpdate({
      name: editValues.name,
      multiplier: editValues.multiplier,
      identificationRule: {
        type: editValues.ruleType as IdentificationRule['type'],
        condition: editValues.condition
      }
    });
    setIsEditing(false);
  }, [editValues, onUpdate]);

  const getRuleDescription = (rule: IdentificationRule) => {
    if (rule.type === 'email_domain') {
      return `Email ${rule.condition.replace(/_/g, ' ')}`;
    }
    return rule.condition;
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-primary-300">
        <div className="space-y-4">
          <Input
            label="Segment Name"
            value={editValues.name}
            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label="Multiplier"
            type="number"
            min={0}
            max={10}
            step={0.1}
            rightAddon="x"
            value={editValues.multiplier}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              multiplier: parseFloat(e.target.value) || 0
            }))}
            hint="Value multiplier (0-10)"
          />

          <Select
            label="Rule Type"
            options={ruleTypeOptions}
            value={editValues.ruleType}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              ruleType: e.target.value as IdentificationRule['type']
            }))}
          />

          {editValues.ruleType === 'email_domain' ? (
            <Select
              label="Condition"
              options={conditionOptions}
              value={editValues.condition}
              onChange={(e) => setEditValues(prev => ({ ...prev, condition: e.target.value }))}
            />
          ) : (
            <Input
              label="Condition"
              value={editValues.condition}
              onChange={(e) => setEditValues(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="Enter condition..."
            />
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{segment.name}</p>
          <p className="text-sm text-gray-500">
            {getRuleDescription(segment.identificationRule)}
          </p>
        </div>
        <div className="text-right mr-4">
          <p className="text-2xl font-semibold text-gray-900">{segment.multiplier}x</p>
          <p className="text-sm text-gray-500">multiplier</p>
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Button>
          {canRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
