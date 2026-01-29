// src/services/ptoService.ts
import apiClient from '@/lib/api';

export interface PTORequest {
  _id?: string;
  internId: string;
  internName?: string;
  batch?: string;
  name: string;
  email: string;
  team: string;
  leaveType: 'casual' | 'sick' | 'emergency';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PTOListParams {
  intern_id?: string;
  status?: string;
}

export const ptoService = {
  async create(data: Partial<PTORequest>): Promise<PTORequest> {
    const response = await apiClient.post('/pto/', data);
    return response.data;
  },

  async getAll(params?: PTOListParams): Promise<PTORequest[]> {
    const searchParams = new URLSearchParams();
    if (params?.intern_id) searchParams.append('intern_id', params.intern_id);
    if (params?.status) searchParams.append('status', params.status);
    
    const response = await apiClient.get(`/pto/?${searchParams}`);
    return response.data;
  },

  async getById(id: string): Promise<PTORequest> {
    const response = await apiClient.get(`/pto/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<PTORequest>): Promise<PTORequest> {
    const response = await apiClient.patch(`/pto/${id}`, data);
    return response.data;
  },

  async approve(id: string, comments?: string): Promise<PTORequest> {
    return this.update(id, { status: 'approved', comments });
  },

  async reject(id: string, comments?: string): Promise<PTORequest> {
    return this.update(id, { status: 'rejected', comments });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pto/${id}`);
  },

  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }
};
