import apiClient from '@/lib/api';
import { Project } from '@/types/intern';

export const projectService = {
  async getAll() {
    const response = await apiClient.get<Project[]>('/projects/');
    return response.data;
  },

  async create(data: Partial<Project>) {
    const response = await apiClient.post('/projects/', data);
    return response.data;
  }
};
