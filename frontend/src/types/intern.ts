// User roles: admin, scrum_master, intern
export type UserRole = 'admin' | 'scrum_master' | 'intern';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  employee_id?: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  auth_provider?: string;
  created_at?: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  name: string;
  password: string;
  employee_id?: string;
}

export interface UserUpdate {
  role?: UserRole;
  is_approved?: boolean;
  is_active?: boolean;
  employee_id?: string;
}

export interface Intern {
  _id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  branch: string;
  year: number;
  cgpa: number;
  domain: string;
  internType: string;
  isPaid: boolean;
  status: string;
  currentProject?: string;
  mentor: string;
  startDate: string;
  endDate: string;
  joinedDate?: string;
  taskCount: number;
  completedTasks: number;
  dsuStreak: number;
  skills: string[];
  batch: string;
  employeeId?: string; 
}

export interface DSUEntry {
  _id: string;
  internId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers?: string;
  learnings?: string;
  status: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}


export interface Task {
  _id: string;
  internId: string;
  title: string;
  description?: string;
  project: string;
  priority?: string;              // Made optional
  status: string;
  assignedBy?: string;            // Made optional
  dueDate?: string;               // Made optional
  completedAt?: string;
  tags?: string[];                // Made optional
  date?: string;                  // Made optional (for API response)
  task_date?: string;             // Added for backend alias support
  comments?: string;
  created_at?: string;
  updated_at?: string;
}


export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  techStack: string[];
  startDate: string;
  endDate?: string;
  internIds: string[];
  mentor: string;
}





