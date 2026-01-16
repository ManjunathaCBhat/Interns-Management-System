import { Intern, DSUEntry, Task, User, Project } from '@/types/intern';

export const mockProjects: Project[] = [
  { id: '1', name: 'E-Commerce Platform', description: 'Building modern e-commerce solution', status: 'active' },
  { id: '2', name: 'HR Dashboard', description: 'Internal HR management system', status: 'active' },
  { id: '3', name: 'Mobile App', description: 'Cross-platform mobile application', status: 'active' },
  { id: '4', name: 'Analytics Tool', description: 'Data analytics and visualization', status: 'on-hold' },
];

export const mockInterns: Intern[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    avatar: '',
    college: 'IIT Delhi',
    degree: 'B.Tech Computer Science',
    educationStatus: 'studying',
    internType: 'project',
    source: 'college',
    mentor: 'Rahul Verma',
    mentorId: 'm1',
    domain: 'Frontend Development',
    status: 'active',
    isPaid: false,
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    currentProject: 'E-Commerce Platform',
    projectId: '1',
    isBillable: false,
  },
  {
    id: '2',
    name: 'Arjun Patel',
    email: 'arjun.patel@example.com',
    phone: '+91 87654 32109',
    college: 'NIT Trichy',
    degree: 'M.Tech Data Science',
    educationStatus: 'completed',
    internType: 'rs',
    source: 'interview',
    mentor: 'Sneha Gupta',
    mentorId: 'm2',
    domain: 'Backend Development',
    status: 'active',
    isPaid: true,
    stipendAmount: 20000,
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    currentProject: 'HR Dashboard',
    projectId: '2',
    isBillable: true,
  },
  {
    id: '3',
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com',
    phone: '+91 76543 21098',
    college: 'BITS Pilani',
    degree: 'B.Tech Electronics',
    educationStatus: 'studying',
    internType: 'project',
    source: 'reference',
    mentor: 'Rahul Verma',
    mentorId: 'm1',
    domain: 'UI/UX Design',
    status: 'training',
    isPaid: true,
    stipendAmount: 15000,
    startDate: '2024-03-01',
    currentProject: 'Mobile App',
    projectId: '3',
    isBillable: false,
  },
  {
    id: '4',
    name: 'Karthik Nair',
    email: 'karthik.nair@example.com',
    phone: '+91 65432 10987',
    college: 'VIT Vellore',
    degree: 'B.Tech IT',
    educationStatus: 'completed',
    internType: 'rs',
    source: 'hirehut',
    mentor: 'Sneha Gupta',
    mentorId: 'm2',
    domain: 'Full Stack',
    status: 'onboarding',
    isPaid: true,
    stipendAmount: 25000,
    startDate: '2024-03-15',
    endDate: '2024-09-15',
    currentProject: 'Analytics Tool',
    projectId: '4',
    isBillable: true,
  },
  {
    id: '5',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@example.com',
    phone: '+91 54321 09876',
    college: 'IIIT Hyderabad',
    degree: 'B.Tech CS',
    educationStatus: 'studying',
    internType: 'project',
    source: 'informal',
    mentor: 'Rahul Verma',
    mentorId: 'm1',
    domain: 'DevOps',
    status: 'completed',
    isPaid: false,
    startDate: '2023-09-01',
    endDate: '2024-02-28',
    currentProject: 'E-Commerce Platform',
    projectId: '1',
    isBillable: false,
  },
];

export const mockDSUEntries: DSUEntry[] = [
  {
    id: '1',
    internId: '1',
    date: new Date().toISOString().split('T')[0],
    yesterday: 'Completed the product listing page UI with responsive design',
    today: 'Working on cart functionality and payment integration',
    blockers: 'Need API documentation for payment gateway',
    status: 'submitted',
  },
  {
    id: '2',
    internId: '2',
    date: new Date().toISOString().split('T')[0],
    yesterday: 'Fixed authentication bugs and improved session handling',
    today: 'Implementing role-based access control',
    blockers: '',
    status: 'submitted',
    mentorComment: 'Great progress! Keep it up.',
  },
  {
    id: '3',
    internId: '3',
    date: new Date().toISOString().split('T')[0],
    yesterday: 'Created wireframes for onboarding flow',
    today: 'Starting high-fidelity mockups',
    blockers: 'Waiting for brand guidelines from marketing team',
    status: 'submitted',
  },
  {
    id: '4',
    internId: '4',
    date: new Date().toISOString().split('T')[0],
    yesterday: '',
    today: '',
    blockers: '',
    status: 'pending',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    internId: '1',
    title: 'Build Product Listing Page',
    description: 'Create a responsive product listing page with filters and sorting',
    projectId: '1',
    projectName: 'E-Commerce Platform',
    status: 'completed',
    hours: 16,
    createdAt: '2024-03-01',
    completedAt: '2024-03-10',
    mentorFeedback: 'Excellent work on the responsive design!',
  },
  {
    id: '2',
    internId: '1',
    title: 'Implement Shopping Cart',
    description: 'Build cart functionality with add, remove, and quantity update features',
    projectId: '1',
    projectName: 'E-Commerce Platform',
    status: 'in-progress',
    hours: 8,
    createdAt: '2024-03-11',
  },
  {
    id: '3',
    internId: '1',
    title: 'Payment Integration',
    description: 'Integrate Razorpay payment gateway',
    projectId: '1',
    projectName: 'E-Commerce Platform',
    status: 'pending',
    hours: 0,
    createdAt: '2024-03-12',
  },
];

export const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Vikram Singh',
    email: 'vikram.singh@company.com',
    role: 'admin',
    avatar: '',
  },
  {
    id: 'intern1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'intern',
    avatar: '',
    internProfile: mockInterns[0],
  },
];

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'completed':
    case 'submitted':
      return 'success';
    case 'training':
    case 'in-progress':
    case 'review':
      return 'info';
    case 'onboarding':
    case 'pending':
      return 'warning';
    case 'dropped':
    case 'missed':
      return 'error';
    default:
      return 'muted';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
