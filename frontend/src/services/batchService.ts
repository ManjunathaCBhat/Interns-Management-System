// src/services/batchService.ts
import apiClient from '@/lib/api';

export interface Batch {
  _id: string;
  batchId: string;
  batchName: string;
  startDate: string;
  endDate: string;
  duration: number;
  coordinator: string;
  description: string;
  maxInterns: number;
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
  batchId: string;
  batchName: string;
  startDate: string;
  endDate: string;
  duration: number;
  coordinator: string;
  description?: string;
  maxInterns?: number;
  domains?: string[];
}

export interface BatchUpdate {
  batchName?: string;
  endDate?: string;
  coordinator?: string;
  description?: string;
  status?: string;
  maxInterns?: number;
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
};
