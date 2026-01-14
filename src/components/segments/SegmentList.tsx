import React, { useCallback } from 'react';
import { Card, Button } from '@/components/common';
import { SegmentCard } from './SegmentCard';
import type { AudienceSegment } from '@/types';

interface SegmentListProps {
  segments: AudienceSegment[];
  onAdd: (segment: AudienceSegment) => void;
  onUpdate: (id: string, updates: Partial<AudienceSegment>) => void;
  onRemove: (id: string) => void;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  onAdd,
  onUpdate,
  onRemove
}) => {
  const canRemove = segments.length > 1;

  const handleAddSegment = useCallback(() => {
    const newSegment: AudienceSegment = {
      id: crypto.randomUUID(),
      name: `Segment ${segments.length + 1}`,
      multiplier: 1.0,
      identificationRule: {
        type: 'email_domain',
        condition: 'not_in_blocklist'
      }
    };
    onAdd(newSegment);
  }, [segments.length, onAdd]);

  const addButton = (
    <Button variant="outline" size="sm" onClick={handleAddSegment}>
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Segment
    </Button>
  );

  return (
    <Card
      title="Audience Segments"
      subtitle="Configure value multipliers for different audience types"
      action={addButton}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map((segment) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            onUpdate={(updates) => onUpdate(segment.id, updates)}
            onRemove={() => onRemove(segment.id)}
            canRemove={canRemove}
          />
        ))}
      </div>
    </Card>
  );
};
