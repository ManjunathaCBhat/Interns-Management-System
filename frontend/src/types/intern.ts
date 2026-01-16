export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export interface Intern {
  _id: string;
  name: string;
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
}

export interface Task {
  _id: string;
  internId: string;
  title: string;
  description?: string;
  project: string;
  priority: string;
  status: string;
  assignedBy: string;
  dueDate: string;
  completedAt?: string;
  tags: string[];
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
