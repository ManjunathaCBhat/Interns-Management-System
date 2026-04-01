// src/services/taskService.ts
import apiClient from '@/lib/api';
import { Task } from '@/types/intern';

export interface TaskListParams {
  intern_id?: string;
  status?: string;
  date?: string;
  skip?: number;
  limit?: number;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  skip: number;
  limit: number;
}

export const taskService = {
  async getAll(params?: TaskListParams): Promise<Task[]> {
    const searchParams = new URLSearchParams();

    if (params?.intern_id) {
      searchParams.append('intern_id', params.intern_id);
    }

    if (params?.status) {
      searchParams.append('status', params.status);
    }

    if (params?.skip !== undefined) {
      searchParams.append('skip', params.skip.toString());
    }

    if (params?.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }

    const response = await apiClient.get(
      `/tasks/?${searchParams.toString()}`
    );

    // Handle both paginated and non-paginated responses for backward compatibility
    if (response.data.items) {
      return response.data.items;
    }
    return response.data;
  },

  async getAllPaginated(params?: TaskListParams): Promise<TaskListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.intern_id) {
      searchParams.append('intern_id', params.intern_id);
    }

    if (params?.status) {
      searchParams.append('status', params.status);
    }

    if (params?.skip !== undefined) {
      searchParams.append('skip', params.skip.toString());
    }

    if (params?.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }

    const response = await apiClient.get(
      `/tasks/?${searchParams.toString()}`
    );

    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  async create(data: Partial<Task>): Promise<Task> {
    const response = await apiClient.post('/tasks/', data);
    return response.data;
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${id}`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};