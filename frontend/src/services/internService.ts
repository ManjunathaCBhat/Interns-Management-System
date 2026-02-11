import apiClient from '@/lib/api';
import { Intern } from '@/types/intern';

export interface InternListParams {
  status?: string;
  internType?: string;
  batch?: string;
  skip?: number;
  limit?: number;
}

export interface InternListResponse {
  items: Intern[];
  total: number;
  skip: number;
  limit: number;
}

export const internService = {
  async getAll(params?: InternListParams): Promise<InternListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.status) searchParams.append('status', params.status);
    if (params?.internType) searchParams.append('internType', params.internType);
    if (params?.batch) searchParams.append('batch', params.batch);
    if (params?.skip !== undefined) searchParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) searchParams.append('limit', String(params.limit));

    const response = await apiClient.get(`/interns/?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Intern> {
    const response = await apiClient.get(`/interns/${id}`);
    return response.data;
  },

  async create(data: Partial<Intern>): Promise<Intern> {
    const response = await apiClient.post('/interns/', data);
    return response.data;
  },

  async update(id: string, data: Partial<Intern>): Promise<Intern> {
    const response = await apiClient.patch(`/interns/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/interns/${id}`);
  }
};
