import apiClient from '@/lib/api';
import { User, UserUpdate, UserRegistration } from '@/types/intern';

export interface CreateUserPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'scrum_master' | 'intern';
}

export const userService = {
  // Get current user profile
  async getCurrentProfile(): Promise<User> {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Get all users (admin only)
  async getAll(pendingOnly: boolean = false): Promise<User[]> {
    const params = pendingOnly ? { pending_only: true } : {};
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  // Get pending users (admin only)
  async getPending(): Promise<User[]> {
    const response = await apiClient.get('/admin/users/pending');
    return response.data;
  },

  // Update user (approve/assign role)
  async update(userId: string, data: UserUpdate): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  // Approve user and assign role
  async approveUser(userId: string, role: 'admin' | 'scrum_master' | 'intern'): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${userId}`, {
      is_approved: true,
      role: role
    });
    return response.data;
  },

  // Reject/deactivate user
  async rejectUser(userId: string): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${userId}`, {
      is_active: false
    });
    return response.data;
  },

  // Legacy method for backward compatibility
  async updateRole(userId: string, role: 'admin' | 'scrum_master' | 'intern') {
    const response = await apiClient.patch(`/admin/users/${userId}`, { role });
    return response.data;
  },

  // Delete user
  async delete(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Register new user (public)
  async register(data: UserRegistration): Promise<User> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }
};