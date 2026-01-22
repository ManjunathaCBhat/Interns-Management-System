import apiClient from '@/lib/api';

export interface CreateUserPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'scrum_master' | 'intern';
}

export const userService = {
  async getAll() {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  async create(data: CreateUserPayload) {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  async updateRole(userId: string, role: 'admin' | 'scrum_master' | 'intern') {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async delete(userId: string) {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};