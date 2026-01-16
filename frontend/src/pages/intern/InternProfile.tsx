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
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Avatar from '@/components/shared/Avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockInterns, formatCurrency } from '@/data/mockData';

const InternProfile: React.FC = () => {
  const { user } = useAuth();
  
  // Get intern profile - using first intern for demo
  const intern = user?.internProfile || mockInterns[0];

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
          <div className="hero-gradient h-32 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4">
              <Avatar name={intern.name} size="xl" className="ring-4 ring-background" />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{intern.name}</h1>
                <p className="text-muted-foreground">{intern.domain}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <StatusBadge status={intern.status} />
                  <span className="text-sm text-muted-foreground">•</span>
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Personal Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{intern.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{intern.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-medium">{intern.degree}</p>
                    <p className="text-sm text-muted-foreground">{intern.college}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Project</p>
                    <p className="font-medium">{intern.currentProject}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mentor</p>
                    <p className="font-medium">{intern.mentor}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {new Date(intern.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {intern.endDate && ` - ${new Date(intern.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Intern Type</span>
                <span className="font-medium uppercase">{intern.internType}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="font-medium capitalize">{intern.source}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <span className={`font-medium ${intern.isPaid ? 'text-success' : 'text-muted-foreground'}`}>
                  {intern.isPaid ? formatCurrency(intern.stipendAmount || 0) : 'Unpaid'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Billable</span>
                <span className={`font-medium ${intern.isBillable ? 'text-success' : 'text-muted-foreground'}`}>
                  {intern.isBillable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Education Status</span>
                <span className="font-medium capitalize">{intern.educationStatus}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Growth Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                        item.status === 'completed'
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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;
