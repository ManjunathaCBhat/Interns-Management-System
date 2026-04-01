import apiClient from '@/lib/api';
import { Project } from '@/types/intern';

export const projectService = {
  async getAll() {
    const response = await apiClient.get<Project[]>('/projects/');
    return response.data;
  },

  async getAssigned() {
    const response = await apiClient.get<Project[]>('/projects/assigned');
    return response.data;
  },

  async getUpdates(projectId: string, limit = 10) {
    const response = await apiClient.get(`/projects/${projectId}/updates`, {
      params: { limit },
    });
    return response.data;
  },

  async assignInterns(projectId: string, internIds: string[]) {
    const response = await apiClient.post(`/projects/${projectId}/interns`, {
      internIds,
    });
    return response.data;
  },

  async create(data: Partial<Project>) {
    const response = await apiClient.post('/projects/', data);
    return response.data;
  },

  async update(projectId: string, data: Partial<Project>) {
    const response = await apiClient.patch(`/projects/${projectId}`, data);
    return response.data;
  },
}
