import React, { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Card, Button } from '@/components/common';
import { FunnelStep } from './FunnelStep';
import type { FunnelStep as FunnelStepType } from '@/types';

interface FunnelBuilderProps {
  steps: FunnelStepType[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onUpdateStep: (id: string, updates: Partial<FunnelStepType>) => void;
  onAddStep: (name?: string) => void;
  onRemoveStep: (id: string) => void;
  canAddStep: boolean;
  canRemoveStep: boolean;
}

export const FunnelBuilder: React.FC<FunnelBuilderProps> = ({
  steps,
  onReorder,
  onUpdateStep,
  onAddStep,
  onRemoveStep,
  canAddStep,
  canRemoveStep
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Require 8px movement before drag starts
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  }, [steps, onReorder]);

  const handleAddStep = useCallback(() => {
    const stepNumber = steps.length + 1;
    onAddStep(`Step ${stepNumber}`);
  }, [steps.length, onAddStep]);

  const addButton = canAddStep ? (
    <Button variant="outline" size="sm" onClick={handleAddStep}>
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Step
    </Button>
  ) : (
    <span className="text-sm text-gray-500">Max 10 steps</span>
  );

  return (
    <Card
      title="Conversion Funnel"
      subtitle="Define your conversion steps (drag to reorder)"
      action={addButton}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {steps.map((step, index) => (
              <FunnelStep
                key={step.id}
                step={step}
                index={index}
                onUpdate={(updates) => onUpdateStep(step.id, updates)}
                onRemove={() => onRemoveStep(step.id)}
                canRemove={canRemoveStep}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No funnel steps defined. Add your first step to get started.</p>
        </div>
      )}
    </Card>
  );
};
