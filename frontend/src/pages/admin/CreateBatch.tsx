import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { batchService } from '@/services/batchService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CreateBatch: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [batchName, setBatchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!batchName || !startDate || !coordinator) {
      toast({
        title: 'Missing fields',
        description: 'Batch name, start date, and coordinator are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const createdBatch = await batchService.create({
        batchName,
        startDate,
        coordinator,
        description: description || undefined,
      });

      toast({
        title: 'Batch created',
        description: `Batch "${createdBatch.batchName}" created successfully! You can now add interns to it.`,
      });
      navigate(`/admin/batches`);
    } catch (error: any) {
      toast({
        title: 'Create failed',
        description: error?.response?.data?.detail || 'Failed to create batch',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Batch</h1>
            <p className="text-muted-foreground">Define batch details and manage interns.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/batches')}>
            Back to Batches
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <Input
                  placeholder="Batch name *"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Start Date *</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Coordinator *</label>
                  <Input
                    placeholder="Coordinator name"
                    value={coordinator}
                    onChange={(e) => setCoordinator(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Creating...' : 'Create Batch'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateBatch;
