// Helper functions for shared components
export const getInitials = (name: string): string => {
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Mock intern data for fallback/demo purposes
export interface MockIntern {
    _id: string;
    name: string;
    email: string;
    phone: string;
    domain: string;
    status: string;
    internType: string;
    currentProject: string;
    mentor: string;
    startDate: string;
    endDate?: string;
    degree: string;
    college: string;
    source: string;
    isPaid: boolean;
    isBillable: boolean;
    stipendAmount?: number;
    educationStatus: string;
}

export const mockInterns: MockIntern[] = [
    {
        _id: 'demo1',
        name: 'Demo Intern',
        email: 'demo@example.com',
        phone: '+91 9876543210',
        domain: 'Frontend Development',
        status: 'active',
        internType: 'project',
        currentProject: 'Interns360',
        mentor: 'John Doe',
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        degree: 'B.Tech Computer Science',
        college: 'Demo University',
        source: 'campus',
        isPaid: true,
        isBillable: false,
        stipendAmount: 15000,
        educationStatus: 'pursuing',
    },
];
