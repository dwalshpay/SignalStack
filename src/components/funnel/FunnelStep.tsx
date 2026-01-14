import React, { useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Input } from '@/components/common';
import { DragHandle } from './DragHandle';
import type { FunnelStep as FunnelStepType } from '@/types';

interface FunnelStepProps {
  step: FunnelStepType;
  index: number;
  onUpdate: (updates: Partial<FunnelStepType>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const FunnelStep: React.FC<FunnelStepProps> = ({
  step,
  index,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: step.name,
    conversionRate: step.conversionRate,
    monthlyVolume: step.monthlyVolume
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  };

  const handleEdit = useCallback(() => {
    setEditValues({
      name: step.name,
      conversionRate: step.conversionRate,
      monthlyVolume: step.monthlyVolume
    });
    setIsEditing(true);
  }, [step]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    // Generate event name from step name (snake_case)
    const eventName = editValues.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    onUpdate({
      name: editValues.name,
      conversionRate: editValues.conversionRate,
      monthlyVolume: editValues.monthlyVolume,
      eventName
    });
    setIsEditing(false);
  }, [editValues, onUpdate]);

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-4 bg-gray-50 rounded-lg border-2 border-primary-300"
      >
        <div className="flex items-start space-x-4">
          <DragHandle listeners={listeners} attributes={attributes} />

          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-medium flex-shrink-0 mt-1">
            {index + 1}
          </span>

          <div className="flex-1 space-y-3">
            <Input
              label="Step Name"
              value={editValues.name}
              onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Conversion Rate"
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                rightAddon="%"
                value={editValues.conversionRate}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  conversionRate: parseFloat(e.target.value) || 0
                }))}
              />

              <Input
                label="Monthly Volume"
                type="number"
                min={0}
                step={1}
                value={editValues.monthlyVolume}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  monthlyVolume: parseInt(e.target.value) || 0
                }))}
              />
            </div>

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
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors group"
    >
      <div className="flex items-center space-x-4">
        <DragHandle listeners={listeners} attributes={attributes} />

        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
          {index + 1}
        </span>

        <div>
          <p className="font-medium text-gray-900">{step.name}</p>
          <p className="text-sm text-gray-500">
            {step.eventName && (
              <code className="text-xs bg-gray-200 px-1 rounded">{step.eventName}</code>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="font-medium text-gray-900">{step.conversionRate}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Monthly Volume</p>
          <p className="font-medium text-gray-900">{step.monthlyVolume.toLocaleString()}</p>
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
