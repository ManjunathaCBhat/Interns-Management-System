import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ptoService, PTORequest as PTORequestType } from '@/services/ptoService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PageLoader from '@/components/shared/PageLoader';

interface PTOForm {
  leaveType: 'casual' | 'sick' | 'emergency';
  startDate: string;
  endDate: string;
  reason?: string;
}

const PTORequest: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PTORequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PTOForm>({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ptoService.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching PTO requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const numberOfDays = calculateDays(formData.startDate, formData.endDate);

      await ptoService.create({
        internId: user.id,
        name: user.name,
        email: user.email,
        team: 'Engineering',
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfDays,
        reason: formData.reason,
        status: 'pending',
      });

      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setOpen(false);
      await fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading PTO requests..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">PTO/Leave Requests</h1>
            <p className="text-muted-foreground mt-1">
              Manage your paid time off and leave requests
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create PTO Request</DialogTitle>
                <DialogDescription>
                  Submit a new request for paid time off, sick leave, or emergency leave
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type *</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, leaveType: value })
                    }
                  >
                    <SelectTrigger id="leaveType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="emergency">Emergency Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm">
                      <span className="font-medium">Number of Days:</span>{' '}
                      {calculateDays(formData.startDate, formData.endDate)} days
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain the reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leave requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the "New Request" button to create one
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold capitalize">
                          {request.leaveType} Leave
                        </h3>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.startDate).toLocaleDateString()} -{' '}
                        {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {request.numberOfDays} days
                      </p>
                      {request.reason && (
                        <p className="text-sm">{request.reason}</p>
                      )}
                      {request.created_at && (
                        <p className="text-xs text-muted-foreground">
                          Submitted:{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      )}
                      {request.approvedBy && (
                        <div className="text-sm pt-2 border-t mt-2">
                          <p className="text-muted-foreground">
                            Approved by: {request.approvedBy}
                          </p>
                          {request.comments && (
                            <p className="text-muted-foreground">
                              Comments: {request.comments}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PTORequest;
