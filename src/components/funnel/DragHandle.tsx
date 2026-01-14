import React from 'react';

interface DragHandleProps {
  listeners?: React.HTMLAttributes<HTMLButtonElement>;
  attributes?: React.HTMLAttributes<HTMLButtonElement>;
}

export const DragHandle: React.FC<DragHandleProps> = ({ listeners, attributes }) => {
  return (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
      {...listeners}
      {...attributes}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="7" cy="4" r="1.5" />
        <circle cx="7" cy="10" r="1.5" />
        <circle cx="7" cy="16" r="1.5" />
        <circle cx="13" cy="4" r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="13" cy="16" r="1.5" />
      </svg>
    </button>
  );
};
