import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'success',
    completed: 'success',
    done: 'success',
    approved: 'success',
    onboarding: 'info',
    in_progress: 'warning',
    pending: 'warning',
    inactive: 'muted',
    blocked: 'error',
    rejected: 'error',
    terminated: 'error',
  };
  return statusMap[status?.toLowerCase()] || 'muted';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
