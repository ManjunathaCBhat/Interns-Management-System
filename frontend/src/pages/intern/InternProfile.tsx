import React, { useEffect, useState } from 'react';
import { Mail, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userService } from '@/services/UserService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Avatar from '@/components/shared/Avatar';
import PageLoader from '@/components/shared/PageLoader';
import { User as UserType } from '@/types/intern';

const InternProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getCurrentProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading your profile..." />
      </DashboardLayout>
    );
  }

  if (error || !profileData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Unable to Load Profile</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            {error || 'Profile not found'}
          </p>
          <Button onClick={fetchUserProfile} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      scrum_master: 'Scrum Master',
      intern: 'Intern',
    };
    return roleMap[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
              <Avatar name={profileData.name} size="xl" className="ring-4 ring-background" />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold">{profileData.name}</h1>
                <p className="text-muted-foreground text-lg">
                  {getRoleLabel(profileData.role)}
                </p>
                {profileData.employee_id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {profileData.employee_id}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium break-all">{profileData.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Username</p>
                <p className="font-medium">{profileData.username}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="font-medium inline-block px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {getRoleLabel(profileData.role)}
                </p>
              </div>

              {profileData.employee_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                  <p className="font-medium">{profileData.employee_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Account Status</p>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {profileData.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.is_approved
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {profileData.is_approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{formatDate(profileData.created_at)}</p>
                </div>
              </div>

              {profileData.auth_provider && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Auth Provider</p>
                  <p className="font-medium capitalize">{profileData.auth_provider}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Need to update your profile information? Contact your administrator.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUserProfile}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;
