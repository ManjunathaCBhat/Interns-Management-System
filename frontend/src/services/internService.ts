import apiClient from '@/lib/api';
import { Intern } from '@/types/intern';

export const internService = {
  async getAll(status?: string, internType?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (internType) params.append('internType', internType);
    
    const response = await apiClient.get<Intern[]>(`/interns/?${params}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Intern>(`/interns/${id}`);
    return response.data;
  },

  async create(data: Partial<Intern>) {
    const response = await apiClient.post('/interns/', data);
    return response.data;
  },

  async update(id: string, data: Partial<Intern>) {
    const response = await apiClient.patch(`/interns/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/interns/${id}`);
  }
};
