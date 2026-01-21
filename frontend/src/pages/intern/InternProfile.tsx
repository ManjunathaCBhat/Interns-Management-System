import React from 'react';
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
import { mockInterns, formatCurrency } from '@/data/mockData';

const InternProfile: React.FC = () => {
  // ✅ Use mock data like other pages
  const intern = mockInterns[0];

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
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i}>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;