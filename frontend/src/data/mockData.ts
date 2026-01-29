// Helper functions for shared components

/**
 * Get initials from a name string
 */
export const getInitials = (name: string): string => {
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Get status color based on status string
 */
export const getStatusColor = (status: string): string => {
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
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
};
