// src/services/adminService.ts
import apiClient from '@/lib/api';

export interface DashboardStats {
  totalInterns: number;
  activeInterns: number;
  projectInterns: number;
  rsInterns: number;
  paidInterns: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletion: number;
  submittedDSUs: number;
  pendingDSUs: number;
  pendingPTOs: number;
  approvedPTOs: number;
  dsuCompletion: number;
  totalBatches: number;
  activeBatches: number;
  upcomingBatches: number;
}

export interface RecentIntern {
  _id: string;
  name: string;
  email: string;
  batch?: string;
  internType: string;
  domain: string;
  status: string;
  completedTasks: number;
  taskCount: number;
  dsuStreak: number;
}

export interface BlockedIntern {
  _id: string;
  internId: string;
  internName: string;
  internEmail: string;
  batch: string;
  blockers: string;
  date: string;
}

export interface PendingPTO {
  _id: string;
  internId: string;
  internName: string;
  batch: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  leaveType: string;
}

export interface BatchPerformance {
  _id: string;
  batchId: string;
  batchName: string;
  avgTaskCompletion: number;
  avgDSUStreak: number;
  totalInterns: number;
  activeInterns: number;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  async getRecentInterns(limit: number = 5): Promise<RecentIntern[]> {
    const response = await apiClient.get(`/admin/dashboard/recent-interns?limit=${limit}`);
    return response.data;
  },

  async getBlockedInterns(): Promise<BlockedIntern[]> {
    const response = await apiClient.get('/admin/dashboard/blocked-interns');
    return response.data;
  },

  async getPendingPTOs(limit: number = 5): Promise<PendingPTO[]> {
    const response = await apiClient.get(`/admin/dashboard/pending-ptos?limit=${limit}`);
    return response.data;
  },

  async getBatchPerformance(): Promise<BatchPerformance[]> {
    const response = await apiClient.get('/admin/analytics/batch-performance');
    return response.data;
  },
};
