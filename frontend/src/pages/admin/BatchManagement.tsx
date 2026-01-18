// src/pages/admin/BatchManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Users, Calendar, TrendingUp, Layers } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { batchService } from '@/services/batchService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Batch {
  _id: string;
  batchId: string;
  batchName: string;
  startDate: string;
  endDate: string;
  coordinator: string;
  totalInterns: number;
  activeInterns: number;
  status: string;
  averageTaskCompletion: number;
}

const BatchManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchService.getAll();
      setBatches(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load batches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      archived: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Batch Management</h1>
            <p className="text-muted-foreground">Manage intern batches and cohorts</p>
          </div>
          <Button onClick={() => navigate('/admin/batches/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </div>

        {/* Batches Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <Card key={batch._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{batch.batchName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{batch.batchId}</p>
                  </div>
                  <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coordinator</p>
                    <p className="font-medium">{batch.coordinator}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {new Date(batch.startDate).toLocaleDateString()} -{' '}
                      {new Date(batch.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{batch.activeInterns}</p>
                      <p className="text-xs text-muted-foreground">Active Interns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{batch.averageTaskCompletion}%</p>
                      <p className="text-xs text-muted-foreground">Avg Progress</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/batches/${batch._id}`)}
                  >
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {batches.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No batches found</h3>
              <p className="text-muted-foreground mb-4">Create your first batch to get started</p>
              <Button onClick={() => navigate('/admin/batches/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BatchManagement;
