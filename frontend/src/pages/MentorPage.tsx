import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, User, Briefcase, Users, BookOpen, UserX } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  name: string;
  email: string;
  employeeId: string;
  role: string;
}

interface Mentee {
  name: string;
  employeeId: string;
  email: string;
}

interface Project {
  name: string;
  status: string;
}

interface MentorData {
  mentor: Mentor | null;
  mentees: Mentee[];
  projects: Project[];
}

const MentorPage: React.FC = () => {
  const { toast } = useToast();
  const [mentorData, setMentorData] = useState<MentorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentorData();
  }, []);

  const loadMentorData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users/me/mentor');
      setMentorData(response.data);
    } catch (error: any) {
      console.error('Failed to load mentor data:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to load mentor information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No mentor assigned
  if (!mentorData?.mentor) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-[#0F0E47] to-[#272757] p-6 md:p-8">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">Mentorship Overview</span>
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Your Mentor</h1>
            <p className="mt-1 text-white/80">View your assigned mentor and their project details</p>
          </div>

          <Card>
            <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <UserX size={32} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-1">No Mentor Assigned</p>
                <p className="text-sm text-gray-500">
                  You haven't been assigned a mentor yet. Please contact your administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { mentor, mentees, projects } = mentorData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0F0E47] to-[#272757] p-6 md:p-8">
          <div className="flex items-center gap-2 text-white/80 mb-1">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Mentorship Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Your Mentor</h1>
          <p className="mt-1 text-white/80">Here's your assigned mentor and their project details</p>
        </div>

        {/* Mentor Info Card */}
        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#0F0E47]" />
              Mentor Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Name */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F0E47]/10 shrink-0">
                  <User className="h-5 w-5 text-[#0F0E47]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="font-semibold">{mentor.name}</p>
                  <p className="text-xs text-muted-foreground">{mentor.role}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F0E47]/10 shrink-0">
                  <Mail className="h-5 w-5 text-[#0F0E47]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-semibold text-sm break-all">{mentor.email || 'Not available'}</p>
                </div>
              </div>

              {/* Employee ID */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F0E47]/10 shrink-0">
                  <Briefcase className="h-5 w-5 text-[#0F0E47]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Employee ID</p>
                  <p className="font-semibold">{mentor.employeeId || 'Not available'}</p>
                </div>
              </div>

              {/* Mentees Count */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F0E47]/10 shrink-0">
                  <Users className="h-5 w-5 text-[#0F0E47]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Mentees Assigned</p>
                  <p className="font-semibold">{mentees.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentees + Projects */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Interns under this mentor */}
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-[#0F0E47]" />
                Interns ({mentees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {mentees.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No mentees assigned</p>
                </div>
              ) : (
                <div className="divide-y">
                  {mentees.map((mentee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F0E47]/10 text-[#0F0E47] text-sm font-bold shrink-0">
                          {mentee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{mentee.name}</p>
                          {mentee.email && (
                            <p className="text-xs text-muted-foreground truncate">{mentee.email}</p>
                          )}
                        </div>
                      </div>
                      {mentee.employeeId && (
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {mentee.employeeId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Projects */}
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-[#0F0E47]" />
                Current Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No active projects</p>
                </div>
              ) : (
                <div className="divide-y">
                  {projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <p className="font-medium">{project.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.status.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorPage;
