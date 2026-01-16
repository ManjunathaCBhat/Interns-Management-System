// import React, { useState } from 'react';
// import {
//   Search,
//   Filter,
//   Download,
//   Plus,
//   MoreVertical,
//   Edit,
//   Trash2,
//   Eye,
//   UserPlus,
// } from 'lucide-react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import StatusBadge from '@/components/shared/StatusBadge';
// import Avatar from '@/components/shared/Avatar';
// import { mockInterns, formatCurrency } from '@/data/mockData';
// import { Intern, InternStatus, InternType } from '@/types/intern';

// const InternManagement: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [typeFilter, setTypeFilter] = useState<string>('all');
//   const [interns] = useState<Intern[]>(mockInterns);

//   const filteredInterns = interns.filter((intern) => {
//     const matchesSearch =
//       intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       intern.domain.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesStatus =
//       statusFilter === 'all' || intern.status === statusFilter;
//     const matchesType = typeFilter === 'all' || intern.internType === typeFilter;

//     return matchesSearch && matchesStatus && matchesType;
//   });

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
//               Intern Management
//             </h1>
//             <p className="text-muted-foreground">
//               Manage all interns, their projects, and status
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline">
//               <Download className="mr-2 h-4 w-4" />
//               Export
//             </Button>
//             <Button variant="accent">
//               <Plus className="mr-2 h-4 w-4" />
//               Add Intern
//             </Button>
//           </div>
//         </div>

//         {/* Filters */}
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex flex-col gap-4 md:flex-row md:items-center">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search interns..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <div className="flex gap-3">
//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger className="w-[140px]">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="onboarding">Onboarding</SelectItem>
//                     <SelectItem value="training">Training</SelectItem>
//                     <SelectItem value="active">Active</SelectItem>
//                     <SelectItem value="completed">Completed</SelectItem>
//                     <SelectItem value="dropped">Dropped</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Select value={typeFilter} onValueChange={setTypeFilter}>
//                   <SelectTrigger className="w-[140px]">
//                     <SelectValue placeholder="Type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Types</SelectItem>
//                     <SelectItem value="project">Project</SelectItem>
//                     <SelectItem value="rs">RS</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Interns Table */}
//         <Card>
//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="border-b bg-muted/30">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Intern
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Type
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Domain
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Project
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Mentor
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Status
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
//                       Paid
//                     </th>
//                     <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {filteredInterns.map((intern) => (
//                     <tr
//                       key={intern.id}
//                       className="hover:bg-muted/30 transition-colors"
//                     >
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <Avatar name={intern.name} size="sm" />
//                           <div>
//                             <p className="font-medium">{intern.name}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {intern.email}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
//                             intern.internType === 'rs'
//                               ? 'bg-accent/10 text-accent'
//                               : 'bg-muted text-muted-foreground'
//                           }`}
//                         >
//                           {intern.internType}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-sm">{intern.domain}</td>
//                       <td className="px-4 py-3 text-sm">{intern.currentProject}</td>
//                       <td className="px-4 py-3 text-sm">{intern.mentor}</td>
//                       <td className="px-4 py-3">
//                         <StatusBadge status={intern.status} />
//                       </td>
//                       <td className="px-4 py-3">
//                         {intern.isPaid ? (
//                           <span className="text-sm font-medium text-success">
//                             {formatCurrency(intern.stipendAmount || 0)}
//                           </span>
//                         ) : (
//                           <span className="text-sm text-muted-foreground">
//                             Unpaid
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex justify-end">
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="icon">
//                                 <MoreVertical className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem>
//                                 <Eye className="mr-2 h-4 w-4" />
//                                 View Profile
//                               </DropdownMenuItem>
//                               <DropdownMenuItem>
//                                 <Edit className="mr-2 h-4 w-4" />
//                                 Edit
//                               </DropdownMenuItem>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem className="text-destructive focus:text-destructive">
//                                 <Trash2 className="mr-2 h-4 w-4" />
//                                 Remove
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {filteredInterns.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
//                 <h3 className="text-lg font-medium">No interns found</h3>
//                 <p className="text-muted-foreground">
//                   Try adjusting your search or filters
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Pagination */}
//         {filteredInterns.length > 0 && (
//           <div className="flex items-center justify-between">
//             <p className="text-sm text-muted-foreground">
//               Showing {filteredInterns.length} of {interns.length} interns
//             </p>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" disabled>
//                 Previous
//               </Button>
//               <Button variant="outline" size="sm" disabled>
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default InternManagement;

import { useState, useEffect } from 'react';
import { internService } from '@/services/internService';
import { Intern } from '@/types/intern';


export default function InternManagement() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchInterns();
  }, [statusFilter, typeFilter]);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const data = await internService.getAll(
        statusFilter || undefined, 
        typeFilter || undefined
      );
      setInterns(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch interns:', err);
      setError(err.response?.data?.detail || 'Failed to load interns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this intern?')) return;
    
    try {
      await internService.delete(id);
      setInterns(interns.filter(i => i._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete intern');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading interns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
        <button 
          onClick={fetchInterns}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intern Management</h1>
          <p className="text-gray-600 mt-1">{interns.length} total interns</p>
        </div>
        
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          + Add Intern
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="training">Training</option>
          <option value="onboarding">Onboarding</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="project">Project</option>
          <option value="rs">R&S</option>
        </select>

        {(statusFilter || typeFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setTypeFilter('');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DSU Streak
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interns.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No interns found
                </td>
              </tr>
            ) : (
              interns.map((intern) => (
                <tr key={intern._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {intern.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {intern.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{intern.college}</div>
                    <div className="text-sm text-gray-500">{intern.branch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {intern.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      intern.status === 'active' ? 'bg-green-100 text-green-800' :
                      intern.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                      intern.status === 'onboarding' ? 'bg-blue-100 text-blue-800' :
                      intern.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {intern.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${intern.taskCount > 0 ? (intern.completedTasks / intern.taskCount) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      {intern.completedTasks}/{intern.taskCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      🔥 {intern.dsuStreak}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      intern.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {intern.internType.toUpperCase()} {intern.isPaid && '💰'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => window.location.href = `/admin/interns/${intern._id}`}
                    >
                      View
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(intern._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

