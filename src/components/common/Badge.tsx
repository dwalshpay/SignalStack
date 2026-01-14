import React from 'react';
import type { VolumeStatus } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500',
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  size = 'sm',
  dot = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantStyles[variant]}
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      `}
    >
      {dot && (
        <span
          className={`
            mr-1.5 h-2 w-2 rounded-full
            ${dotStyles[variant]}
          `}
        />
      )}
      {children}
    </span>
  );
};

// Helper component for volume status badges
export const VolumeStatusBadge: React.FC<{ status: VolumeStatus }> = ({ status }) => {
  const config: Record<VolumeStatus, { variant: BadgeVariant; label: string }> = {
    sufficient: { variant: 'success', label: 'Sufficient' },
    borderline: { variant: 'warning', label: 'Borderline' },
    insufficient: { variant: 'error', label: 'Insufficient' },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
};
