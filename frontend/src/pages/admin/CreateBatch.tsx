import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { batchService } from '@/services/batchService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CreateBatch: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [yearId, setYearId] = useState('');
  const [monthId, setMonthId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [description, setDescription] = useState('');
  const [maxInterns, setMaxInterns] = useState('50');
  const [domains, setDomains] = useState('');

  const [years, setYears] = useState<{ _id: string; year: number; label?: string }[]>([]);
  const [months, setMonths] = useState<{ _id: string; name: string; order: number }[]>([]);
  const [organizations, setOrganizations] = useState<{ _id: string; name: string }[]>([]);

  const [newYear, setNewYear] = useState('');
  const [newYearLabel, setNewYearLabel] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [newMonthOrder, setNewMonthOrder] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [saving, setSaving] = useState(false);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [startDate, endDate]);

  const loadCategories = async () => {
    const [yearsData, monthsData, orgsData] = await Promise.all([
      batchService.getYears(),
      batchService.getMonths(),
      batchService.getOrganizations(),
    ]);
    setYears(yearsData);
    setMonths(monthsData);
    setOrganizations(orgsData);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!batchId || !batchName || !startDate || !endDate || !coordinator) {
      toast({
        title: 'Missing fields',
        description: 'Batch ID, name, dates, and coordinator are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await batchService.create({
        batchId,
        batchName,
        yearId: yearId || undefined,
        monthId: monthId || undefined,
        organizationId: organizationId || undefined,
        startDate,
        endDate,
        duration,
        coordinator,
        description: description || undefined,
        maxInterns: Number(maxInterns) || undefined,
        domains: domains
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });

      toast({
        title: 'Batch created',
        description: 'The batch is ready for assignments.',
      });
      navigate('/admin/batches');
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

  const addYear = async () => {
    const yearValue = Number(newYear);
    if (!yearValue) return;
    await batchService.createYear({ year: yearValue, label: newYearLabel || undefined });
    setNewYear('');
    setNewYearLabel('');
    await loadCategories();
  };

  const addMonth = async () => {
    const orderValue = Number(newMonthOrder);
    if (!newMonth || !orderValue) return;
    await batchService.createMonth({ name: newMonth, order: orderValue });
    setNewMonth('');
    setNewMonthOrder('');
    await loadCategories();
  };

  const addOrganization = async () => {
    if (!newOrganization) return;
    await batchService.createOrganization({ name: newOrganization });
    setNewOrganization('');
    await loadCategories();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Batch</h1>
            <p className="text-muted-foreground">Define batch details and categories.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/batches')}>
            Back to Batches
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Batch Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Batch ID"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                  />
                  <Input
                    placeholder="Batch name"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Select value={yearId} onValueChange={setYearId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year._id} value={year._id}>
                          {year.label || year.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={monthId} onValueChange={setMonthId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month._id} value={month._id}>
                          {month.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={organizationId} onValueChange={setOrganizationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org._id} value={org._id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Coordinator"
                    value={coordinator}
                    onChange={(e) => setCoordinator(e.target.value)}
                  />
                  <Input
                    placeholder="Max interns"
                    value={maxInterns}
                    onChange={(e) => setMaxInterns(e.target.value)}
                  />
                </div>

                <Input
                  placeholder="Domains (comma separated)"
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                />

                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Duration</span>
                  <span>{duration} days</span>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Batch'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Add Year</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="2026"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                  />
                  <Input
                    placeholder="Label (optional)"
                    value={newYearLabel}
                    onChange={(e) => setNewYearLabel(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={addYear}>
                  Add Year
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Add Month</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="January"
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                  />
                  <Input
                    placeholder="Order"
                    value={newMonthOrder}
                    onChange={(e) => setNewMonthOrder(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={addMonth}>
                  Add Month
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Add Organization</p>
                <Input
                  placeholder="Organization name"
                  value={newOrganization}
                  onChange={(e) => setNewOrganization(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={addOrganization}>
                  Add Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateBatch;
