import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, Plus, Info, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ptoService, PTORequest as PTORequestType } from '@/services/ptoService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface PTOForm {
  leaveType: 'casual' | 'sick' | 'emergency';
  startDate: string;
  endDate: string;
  reason?: string;
}

interface WFHForm {
  leaveType: 'casual' | 'sick' | 'emergency';
  reason: string;
  startDate: string;
  endDate: string;
}

const PTORequest: React.FC = () => {
  const calendarRef = useRef<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isPastDate = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(dateStr) < today;
  };

  useEffect(() => {
    if (!user) return;
    if (!['intern', 'scrum_master'].includes(user.role)) navigate('/intern');
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("PTO");
  const [requests, setRequests] = useState<PTORequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const [formData, setFormData] = useState<PTOForm>({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [wfhData, setWfhData] = useState<WFHForm>({
    leaveType: 'casual',
    reason: '',
    startDate: '',
    endDate: '',
  });

  const fetchRequests = async () => {
    const data = await ptoService.getAll({ intern_id: user?.id });
    setRequests(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const calculateDays = (s: string, e: string) =>
    Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (activeTab === "PTO") {
      // Validate reason
      if (!formData.reason || formData.reason.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Reason is required',
          variant: 'destructive',
        });
        return;
      }

      // Validate dates
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        toast({
          title: 'Validation Error',
          description: 'End date cannot be before start date',
          variant: 'destructive',
        });
        return;
      }

      try {
        await ptoService.create({
          internId: user.id,
          name: user.name,
          email: user.email,
          team: 'Engineering',
          type: 'PTO',
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          numberOfDays: calculateDays(formData.startDate, formData.endDate),
          reason: formData.reason,
          status: 'pending',
        });

        setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        setOpen(false);
        fetchRequests();

        toast({
          title: 'Success',
          description: 'PTO Request submitted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.response?.data?.detail || 'Failed to submit PTO request',
          variant: 'destructive',
        });
      }
    }

    if (activeTab === "WFH") {
      // Validate date
      if (!wfhData.startDate) {
        toast({
          title: 'Validation Error',
          description: 'Date is required',
          variant: 'destructive',
        });
        return;
      }

      try {
        await ptoService.create({
          internId: user.id,
          name: user.name,
          email: user.email,
          team: 'Engineering',
          type: 'WFH',
          leaveType: wfhData.leaveType,
          startDate: wfhData.startDate,
          endDate: wfhData.startDate, // Same as start date for single-day WFH
          numberOfDays: 1,
          reason: wfhData.reason || '',
          status: 'pending',
        });

        setWfhData({ leaveType: 'casual', reason: '', startDate: '', endDate: wfhData.startDate });
        setOpen(false);
        fetchRequests();

        toast({
          title: 'Success',
          description: 'WFH Request submitted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.response?.data?.detail || 'Failed to submit WFH request',
          variant: 'destructive',
        });
      }
    }
  };

  const toCalendarEvents = (data: PTORequestType[]) =>
    data.map(req => ({
      title: req.status.toUpperCase(),
      start: req.startDate,
      end: req.endDate,
      backgroundColor:
        req.status === "approved" ? "green" :
        req.status === "rejected" ? "red" :
        "orange"
    }));

  const ptoRequests = requests.filter((req) => (req.type || 'PTO') === 'PTO');
  const wfhRequests = requests.filter((req) => req.type === 'WFH');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0F0E47] to-[#272757] p-4 md:p-6 mb-6">
        <h1 className="text-xl font-bold text-white md:text-2xl">WFH Requests</h1>
        <p className="mt-1 text-sm text-white/80">Manage your work from home schedule</p>
      </div>

      <Tabs defaultValue="WFH" onValueChange={setActiveTab}>
        {["WFH"].map(tab => (
          <TabsContent key={tab} value={tab}>

            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span> Pending
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Approved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Rejected
                </span>
              </div>

              <Button
                onClick={() => setOpen(true)}
                className="shadow-lg px-6 py-2"
              >
                <Plus className="mr-2 h-4 w-4"/>New Request
              </Button>
            </div>

            <div className="flex items-center gap-4 mx-auto max-w-4xl">
              <button
                onClick={() => calendarRef.current?.getApi().prev()}
                className="p-3 rounded-lg bg-[#0F0E47] text-white hover:bg-[#272757] transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="flex-1">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={tab==="PTO" ? toCalendarEvents(ptoRequests) : toCalendarEvents(wfhRequests)}
                  nowIndicator
                  height="520px"
                  aspectRatio={1.8}
                  dayMaxEventRows={1}
                  headerToolbar={{
                    left: '',
                    center: 'title',
                    right: ''
                  }}
                  dayCellClassNames={(arg)=>arg.isToday?['bg-[#8686AC]/20','border','border-[#0F0E47]']:[]}
                  dateClick={(info:any)=>{
                    if(isPastDate(info.dateStr)){
                      toast({
                        title: 'Invalid Date',
                        description: 'The selected day is in the past',
                        variant: 'destructive',
                      });
                      return;
                    }

                    tab==="PTO"
                      ?setFormData({...formData,startDate:info.dateStr,endDate:info.dateStr})
                      :setWfhData({...wfhData,startDate:info.dateStr,endDate:info.dateStr});

                    setOpen(true);
                  }}
                />
              </div>

              <button
                onClick={() => calendarRef.current?.getApi().next()}
                className="p-3 rounded-lg bg-[#0F0E47] text-white hover:bg-[#272757] transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

          </TabsContent>
        ))}
      </Tabs>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="p-6 border-b text-center relative">
              <h2 className="text-xl font-semibold">WFH Request</h2>
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Date</label>
                <Input
                  type="date"
                  value={wfhData.startDate}
                  onChange={e=>setWfhData({...wfhData,startDate:e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reason (Optional)</label>
                <Textarea
                  placeholder="Enter reason..."
                  value={wfhData.reason}
                  onChange={e=>setWfhData({...wfhData,reason:e.target.value})}
                  rows={3}
                />
              </div>

              <Button className="w-full">Submit</Button>
            </form>
          </div>
        </>
      )}

      {error && (
        <Card className="mt-4 border-red-300 bg-red-50">
          <CardContent className="pt-6 flex gap-2 text-red-700">
            <AlertCircle/> {error}
          </CardContent>
        </Card>
      )}

    </DashboardLayout>
  );
};

export default PTORequest;