import React, { useEffect, useState } from 'react';
import { Download, Search as SearchIcon } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLoader from '@/components/shared/PageLoader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import apiClient from '@/lib/api';

const performanceOptions = [
  { value: 'not-assessed', label: 'Not Assessed', color: '#d9d9d9' },
  { value: 'poor', label: 'Poor', color: '#ff4d4f' },
  { value: 'fair', label: 'Fair', color: '#faad14' },
  { value: 'good', label: 'Good', color: '#52c41a' },
  { value: 'excellent', label: 'Excellent', color: '#1890ff' },
];

interface ReferenceIntern {
  _id: string;
  name: string;
  email: string;
  phone: string;
  referredBy: string;
  status: 'active' | 'inactive' | 'pending';
  performance: string;
  comments: string;
}

const ReferenceManagement: React.FC = () => {
  const [data, setData] = useState<ReferenceIntern[]>([]);
  const [originalData, setOriginalData] = useState<ReferenceIntern[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/interns');

      const mapped: ReferenceIntern[] = res.data.length
        ? res.data.map((i: any) => ({
            _id: i._id,
            name: i.name || '-',
            email: i.email || '-',
            phone: i.phone || '-',
            referredBy: i.referredBy || '-',
            status: i.status || 'pending',
            performance: i.performance || 'not-assessed',
            comments: i.comments || '',
          }))
        : [];

      setData(mapped);
      setOriginalData(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const updateField = async (id: string, payload: any) => {
    await apiClient.patch(`/admin/interns/${id}`, payload);
    fetchInterns();
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const v = value.toLowerCase();
    if (!v) {
      setData(originalData);
      return;
    }

    setData(
      originalData.filter(
        (i) =>
          i.name.toLowerCase().includes(v) ||
          i.email.toLowerCase().includes(v) ||
          i.phone.includes(v)
      )
    );
  };

  const exportCSV = () => {
    const headers = [
      'Sl.No',
      'Name',
      'Email',
      'Phone',
      'Referred By',
      'Status',
      'Performance',
      'Comments',
    ];

    const rows = originalData.map((d, i) => [
      i + 1,
      d.name,
      d.email,
      d.phone,
      d.referredBy,
      d.status,
      d.performance,
      d.comments,
    ]);

    const csv =
      headers.join(',') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reference_sheet.csv';
    a.click();
  };

  const getPerformanceColor = (value: string) => {
    return performanceOptions.find((p) => p.value === value)?.color || '#d9d9d9';
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reference Sheet</h1>
            <p className="text-muted-foreground">
              Manage intern references and interview performance
            </p>
          </div>
          <Button onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <PageLoader message="Loading interns..." />
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-lg">No reference data found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Sl.No</th>
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold">Referred By</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Performance</th>
                      <th className="text-left py-3 px-4 font-semibold">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((intern, index) => (
                      <tr key={intern._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{intern.name}</td>
                        <td className="py-3 px-4 text-sm">{intern.email}</td>
                        <td className="py-3 px-4 text-sm">{intern.phone}</td>
                        <td className="py-3 px-4 text-sm">{intern.referredBy}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={intern.status}
                            onValueChange={(val) =>
                              updateField(intern._id, { status: val })
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={intern.performance}
                            onValueChange={(val) =>
                              updateField(intern._id, { performance: val })
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {performanceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <span style={{ color: option.color }}>
                                    ● {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-sm max-w-xs truncate">
                          {intern.comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Info */}
        {data.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {data.length} of {originalData.length} records
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReferenceManagement;