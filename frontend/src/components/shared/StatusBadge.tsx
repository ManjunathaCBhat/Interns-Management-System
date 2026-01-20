import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const colorType = getStatusColor(status);

  const colorClasses = {
    success: 'bg-success-light text-success border-success/20',
    warning: 'bg-warning-light text-warning border-warning/20',
    error: 'bg-error-light text-error border-error/20',
    info: 'bg-info-light text-info border-info/20',
    muted: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        colorClasses[colorType as keyof typeof colorClasses] || colorClasses.muted,
        className
      )}
    >
      {status.replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
