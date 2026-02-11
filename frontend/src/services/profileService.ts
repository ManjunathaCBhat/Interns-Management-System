import api from './apiClient';

export interface InternProfileData {
  startDate?: string;
  joinedDate?: string;
  endDate?: string;
  currentProject?: string;
  mentor?: string;
  skills?: string[];
  phone?: string;
  internType?: string;
  payType?: string;
  college?: string;
  degree?: string;
  batch?: string;
}

export const profileService = {
  // Get current user's profile
  async getMyProfile() {
    try {
      const response = await api.get('/interns/me/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update current user's profile
  async updateMyProfile(profileData: InternProfileData) {
    try {
      const response = await api.put('/interns/me/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

export default profileService;