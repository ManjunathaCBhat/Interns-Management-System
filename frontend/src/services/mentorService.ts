import apiClient from '@/lib/api';

export interface MentorRequest {
  _id: string;
  requesterUserId: string;
  requesterEmail: string;
  requesterName: string;
  mentorUserId: string;
  mentorEmail: string;
  mentorName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MentorshipSummary {
  mentor: { userId: string; name: string; email: string } | null;
  mentees: { userId: string; name: string; email: string }[];
}

export const mentorService = {
  async requestMentor(mentorUserId: string): Promise<MentorRequest> {
    const response = await apiClient.post('/mentor-requests', { mentorUserId });
    return response.data;
  },

  async getMyRequests(): Promise<MentorRequest[]> {
    const response = await apiClient.get('/mentor-requests/me');
    return response.data;
  },

  async getAllRequests(status?: string): Promise<MentorRequest[]> {
    const response = await apiClient.get('/mentor-requests', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async updateRequest(id: string, status: 'approved' | 'rejected'): Promise<MentorRequest> {
    const response = await apiClient.patch(`/mentor-requests/${id}`, { status });
    return response.data;
  },

  async getMentorships(): Promise<MentorshipSummary> {
    const response = await apiClient.get('/mentorships/me');
    return response.data;
  },
};
