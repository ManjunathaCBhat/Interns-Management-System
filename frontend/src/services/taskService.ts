import apiClient from '@/lib/api';
import { Task } from '@/types/intern';

export const taskService = {
  async getAll(internId?: string, status?: string) {
    const params = new URLSearchParams();
    if (internId) params.append('intern_id', internId);
    if (status) params.append('status', status);
    
    const response = await apiClient.get<Task[]>(`/tasks/?${params}`);
    return response.data;
  },

  async create(data: Partial<Task>) {
    const response = await apiClient.post('/tasks/', data);
    return response.data;
  },

  async update(id: string, data: Partial<Task>) {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  }
};
