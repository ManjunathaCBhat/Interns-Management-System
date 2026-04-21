import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// import { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Mail, User, Briefcase, Users, BookOpen, UserX } from 'lucide-react';
// import apiClient from '@/lib/api';
// import { useToast } from '@/hooks/use-toast';
// import profileService from '@/services/profileService';

// interface Mentor {
//   name: string;
//   email: string;
//   employeeId: string;
//   role: string;
// }

// interface Mentee {
//   name: string;
//   employeeId: string;
//   email: string;
// }

// interface Project {
//   name: string;
//   status: string;
// }

// interface MentorData {
//   mentor: Mentor | null;
//   mentees: Mentee[];
//   projects: Project[];
// }

const MentorPage: React.FC = () => {
  // const { toast } = useToast();
  // const [mentorData, setMentorData] = useState<MentorData | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   loadMentorData();
  // }, []);

  // const loadMentorData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await apiClient.get('/users/me/mentor');
  //     let data = response.data;

  //     // If mentor endpoint returns null mentor, try to get from profile
  //     if (!data?.mentor) {
  //       try {
  //         const profileResponse = await profileService.getMyProfile();
  //         if (profileResponse.exists && profileResponse.data?.mentor) {
  //           // Create mentor object from profile data
  //           data = {
  //             mentor: {
  //               name: profileResponse.data.mentor,
  //               email: '',
  //               employeeId: '',
  //               role: 'Mentor',
  //             },
  //             mentees: data?.mentees || [],
  //             projects: data?.projects || [],
  //           };
  //         }
  //       } catch (profileError) {
  //         console.error('Failed to load profile data:', profileError);
  //       }
  //     }

  //     setMentorData(data);
  //   } catch (error: any) {
  //     console.error('Failed to load mentor data:', error);
  //     toast({
  //       title: 'Error',
  //       description: error?.response?.data?.detail || 'Failed to load mentor information',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <DashboardLayout>
  //       <div className="space-y-6">
  //         <Skeleton className="h-32 w-full rounded-2xl" />
  //         <Skeleton className="h-64 w-full rounded-2xl" />
  //         <div className="grid gap-6 md:grid-cols-2">
  //           <Skeleton className="h-64 w-full rounded-2xl" />
  //           <Skeleton className="h-64 w-full rounded-2xl" />
  //         </div>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  // // No mentor assigned
  // if (!mentorData?.mentor) {
  //   return (
  //     <DashboardLayout>
  //       <div className="space-y-6">
  //         <div className="rounded-2xl bg-gradient-to-br from-[#0F0E47] to-[#272757] p-6 md:p-8">
  //           <div className="flex items-center gap-2 text-white/80 mb-1">
  //             <BookOpen className="h-5 w-5" />
  //             <span className="text-sm font-medium">Mentorship Overview</span>
  //           </div>
  //           <h1 className="text-2xl font-bold text-white md:text-3xl">Your Mentor</h1>
  //           <p className="mt-1 text-white/80">View your assigned mentor and their project details</p>
  //         </div>

  //         <Card>
  //           <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center gap-4">
  //             <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
  //               <UserX size={32} className="text-gray-400" />
  //             </div>
  //             <div className="text-center">
  //               <p className="text-lg font-semibold text-gray-700 mb-1">No Mentor Assigned</p>
  //               <p className="text-sm text-gray-500">
  //                 You haven't been assigned a mentor yet. Please contact your administrator.
  //               </p>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  // const { mentor, mentees, projects } = mentorData;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#0F0E47] mb-4">Coming Soon</h1>
          <p className="text-lg text-[#505081]">This feature is under development</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorPage;
