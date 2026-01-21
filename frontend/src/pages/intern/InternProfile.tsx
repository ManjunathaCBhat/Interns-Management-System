import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Edit,
  Clock,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Avatar from '@/components/shared/Avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import { internService } from '@/services/internService';
import { Intern } from '@/types/intern';

const InternProfile: React.FC = () => {
<<<<<<< HEAD
  const { user } = useAuth();
  const [internData, setInternData] = useState<Intern | null>(user?.internProfile || null);
  const [loading, setLoading] = useState(!user?.internProfile);

  useEffect(() => {
    const fetchInternProfile = async () => {
      if (!internData && user?.email) {
        try {
          const allInterns = await internService.getAll({ limit: 100 });
          const items = Array.isArray(allInterns) ? allInterns : allInterns.items;
          const found = items.find(i => i.email === user.email);
          if (found) {
            setInternData(found);
          }
        } catch (error) {
          console.error("Failed to fetch intern profile", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchInternProfile();
  }, [user, internData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!internData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <h2 className="text-xl font-semibold">Intern Profile Not Found</h2>
          <p className="text-muted-foreground">Could not find an intern profile associated with your account.</p>
        </div>
      </DashboardLayout>
    );
  }

  const intern = internData;
=======
  // ✅ Use mock data like other pages
  const intern = mockInterns[0];
>>>>>>> a7f0f5b (Fix registration flow and sidebar updates)

  const timeline = [
    {
      date: intern.startDate,
      title: 'Joined',
      description: 'Started internship program',
      status: 'completed',
    },
    {
      date: '2024-01-22',
      title: 'Onboarding Completed',
      description: 'Finished initial setup and orientation',
      status: 'completed',
    },
    {
      date: '2024-02-01',
      title: 'Training Started',
      description: 'Began technical training sessions',
      status: 'completed',
    },
    {
      date: '2024-02-15',
      title: 'Assigned to Project',
      description: `Started working on ${intern.currentProject}`,
      status: 'completed',
    },
    {
      date: intern.endDate || 'TBD',
      title: 'Internship End',
      description: 'Expected completion date',
      status: 'pending',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-[#2D0B59]" />
          <CardContent className="-mt-16 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar name={intern.name} size="xl" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{intern.name}</h1>
                <p className="text-muted-foreground">{intern.domain}</p>
                <div className="flex gap-2 mt-2">
                  <StatusBadge status={intern.status} />
                  <span className="text-sm uppercase font-medium text-accent">
                    {intern.internType} Intern
                  </span>
                </div>
              </div>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{intern.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{intern.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mentor</p>
              <p className="font-medium">{intern.mentor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-medium">{intern.currentProject}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Growth Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full border-2 ${item.status === 'completed'
                          ? 'bg-accent border-accent'
                          : 'bg-background border-border'
                        }`}
                    >
                      {item.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-accent-foreground rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {typeof item.date === 'string' && item.date !== 'TBD'
                            ? new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                            : item.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
=======
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i}>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
>>>>>>> a7f0f5b (Fix registration flow and sidebar updates)
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;