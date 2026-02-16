// src/services/batchService.ts
import apiClient from '@/lib/api';

export interface Batch {
  _id: string;
  batchId: string;
  batchName: string;
  startDate: string;
  duration: number;
  coordinator: string;
  description: string;
  domains: string[];
  totalInterns: number;
  activeInterns: number;
  completedInterns: number;
  droppedInterns: number;
  averageRating: number;
  averageTaskCompletion: number;
  averageDSUStreak: number;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  createdBy?: string;
  created_at: string;
  updated_at: string;
}

export interface BatchCreate {
  batchName: string;
  startDate: string;
  coordinator: string;
  description?: string;
  domains?: string[];
}

export interface BatchUpdate {
  batchName?: string;
  startDate?: string;
  duration?: number;
  coordinator?: string;
  description?: string;
  status?: string;
  domains?: string[];
}

export const batchService = {
  async getAll(status?: string): Promise<Batch[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/batches/?${params}`);
    return response.data;
  },

  async getById(batchId: string): Promise<Batch> {
    const response = await apiClient.get(`/batches/${batchId}`);
    return response.data;
  },

  async create(data: BatchCreate): Promise<Batch> {
    const response = await apiClient.post('/batches/', data);
    return response.data;
  },

  async update(batchId: string, data: BatchUpdate): Promise<Batch> {
    const response = await apiClient.patch(`/batches/${batchId}`, data);
    return response.data;
  },

  async delete(batchId: string): Promise<void> {
    await apiClient.delete(`/batches/${batchId}`);
  },

  async getInterns(batchId: string): Promise<any[]> {
    const response = await apiClient.get(`/batches/${batchId}/interns`);
    return response.data;
  },

  async addUsersToBatch(batchId: string, userIds: string[]): Promise<any> {
    const response = await apiClient.post(`/batches/${batchId}/users`, userIds);
    return response.data;
  },

  async removeUserFromBatch(batchId: string, userId: string): Promise<void> {
    await apiClient.delete(`/batches/${batchId}/users/${userId}`);
  },
};
