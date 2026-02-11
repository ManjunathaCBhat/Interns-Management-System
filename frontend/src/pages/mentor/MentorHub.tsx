import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mentorService, MentorRequest } from '@/services/mentorService';
import apiClient from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MentorOption {
  id: string;
  name: string;
  email: string;
}

const MentorHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [myRequests, setMyRequests] = useState<MentorRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MentorRequest[]>([]);
  const [mentorships, setMentorships] = useState({ mentor: null as any, mentees: [] as any[] });
  const [loading, setLoading] = useState(true);

  const isApprover = user?.role === 'admin' || user?.role === 'scrum_master';

  const loadData = async () => {
    setLoading(true);
    try {
      const [requests, mentorshipSummary] = await Promise.all([
        mentorService.getMyRequests(),
        mentorService.getMentorships(),
      ]);
      setMyRequests(requests);
      setMentorships(mentorshipSummary);

      if (isApprover) {
        const pending = await mentorService.getAllRequests('pending');
        setPendingRequests(pending);
      }

      const userResponse = await apiClient.get('/users', {
        params: { role: 'intern' },
      });

      const options = (userResponse.data || [])
        .filter((item: any) => item.id !== user?.id)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
        }));

      setMentorOptions(options);
    } catch (error: any) {
      toast({
        title: 'Failed to load data',
        description: error?.response?.data?.detail || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingForMe = useMemo(
    () => myRequests.filter((req) => req.status === 'pending'),
    [myRequests]
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-56 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const requestMentor = async () => {
    if (!selectedMentorId) return;
    try {
      await mentorService.requestMentor(selectedMentorId);
      toast({
        title: 'Request sent',
        description: 'Your mentorship request is pending approval.',
      });
      setSelectedMentorId('');
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Request failed',
        description: error?.response?.data?.detail || 'Unable to send request',
        variant: 'destructive',
      });
    }
  };

  const handleDecision = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await mentorService.updateRequest(requestId, status);
      toast({
        title: `Request ${status}`,
        description: `The mentorship request was ${status}.`,
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error?.response?.data?.detail || 'Unable to update request',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mentorship</h1>
          <p className="text-muted-foreground">
            Request a mentor, track approvals, and manage mentees.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Request a Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentorOptions.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name} ({mentor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={requestMentor} disabled={!selectedMentorId || loading}>
                Send Request
              </Button>
              {pendingForMe.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  You have {pendingForMe.length} pending request(s).
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Mentorship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">My Mentor</p>
                {mentorships.mentor ? (
                  <div className="mt-2 rounded-lg border p-3">
                    <p className="font-medium">{mentorships.mentor.name}</p>
                    <p className="text-xs text-muted-foreground">{mentorships.mentor.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No mentor assigned.</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">My Mentees</p>
                {mentorships.mentees.length ? (
                  <div className="mt-2 space-y-2">
                    {mentorships.mentees.map((mentee) => (
                      <div key={mentee.userId} className="rounded-lg border p-3">
                        <p className="font-medium">{mentee.name}</p>
                        <p className="text-xs text-muted-foreground">{mentee.email}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No mentees assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">No requests found.</p>
            )}
            {myRequests.map((request) => (
              <div key={request._id} className="border-b py-3 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mentor: {request.mentorName}</p>
                    <p className="text-xs text-muted-foreground">{request.mentorEmail}</p>
                  </div>
                  <span className="text-xs uppercase text-muted-foreground">{request.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {isApprover && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              )}
              {pendingRequests.map((request) => (
                <div key={request._id} className="border-b py-3 last:border-b-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{request.requesterName}</p>
                      <p className="text-xs text-muted-foreground">{request.requesterEmail}</p>
                      <p className="text-xs text-muted-foreground">Mentor: {request.mentorName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDecision(request._id, 'approved')}>
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDecision(request._id, 'rejected')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorHub;
