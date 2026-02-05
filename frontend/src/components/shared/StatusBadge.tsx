import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/* ✅ Normalized labels */
const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  ON_HOLD: 'On Hold',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  /* ✅ Normalize status from backend / form */
  const normalizedStatus = status
    ?.toUpperCase()
    .replace(/\s+/g, '_');

  /* ✅ Get label */
  const label =
    STATUS_LABELS[normalizedStatus] || 'Not Started';

  /* ✅ Get color type from your existing utility */
  const colorType = getStatusColor(normalizedStatus);

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
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClasses[colorType as keyof typeof colorClasses] ||
          colorClasses.muted,
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;