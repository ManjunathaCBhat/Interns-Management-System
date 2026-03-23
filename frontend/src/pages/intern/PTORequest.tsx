import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
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
      // Validate reason
      if (!wfhData.reason || wfhData.reason.trim() === '') {
        toast({
          title: 'Validation Error',
          description: 'Reason is required',
          variant: 'destructive',
        });
        return;
      }

      // Validate dates
      if (new Date(wfhData.endDate) < new Date(wfhData.startDate)) {
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
          type: 'WFH',
          leaveType: wfhData.leaveType,
          startDate: wfhData.startDate,
          endDate: wfhData.endDate,
          numberOfDays: calculateDays(wfhData.startDate, wfhData.endDate),
          reason: wfhData.reason,
          status: 'pending',
        });

        setWfhData({ leaveType: 'casual', reason: '', startDate: '', endDate: '' });
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

      <Tabs defaultValue="PTO" onValueChange={setActiveTab}>
        <TabsList className="scale-125 mb-4">
          <TabsTrigger value="PTO" className="px-6 py-3 text-base font-semibold">PTO Requests</TabsTrigger>
          <TabsTrigger value="WFH" className="px-6 py-3 text-base font-semibold">WFH Requests</TabsTrigger>
        </TabsList>

        {["PTO","WFH"].map(tab => (
          <TabsContent key={tab} value={tab}>

            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted-foreground font-medium">
                👉 Click any date to create a {tab} request
              </p>

              <div className="flex gap-4 text-sm -mt-3">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span> Pending
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span> Approved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#8686AC]"></span> Rejected
                </span>
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={tab==="PTO" ? toCalendarEvents(ptoRequests) : toCalendarEvents(wfhRequests)}
                nowIndicator
                height="550px"
                aspectRatio={1.8}
                dayMaxEventRows={1}
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

          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed right-6 bottom-6 shadow-xl px-6 py-3 text-base">
            <Plus className="mr-2 h-4 w-4"/>New Request
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeTab==="PTO"?"Create PTO Request":"Create WFH Request"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* PTO FORM */}
            {activeTab==="PTO" && <>
              <Select value={formData.leaveType} onValueChange={(v:any)=>setFormData({...formData,leaveType:v})}>
                <SelectTrigger><SelectValue placeholder="Select Leave Type"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>

              <Input type="date" value={formData.startDate} onChange={e=>setFormData({...formData,startDate:e.target.value})}/>
              <Input type="date" value={formData.endDate} onChange={e=>setFormData({...formData,endDate:e.target.value})}/>
              <Textarea placeholder="Reason*" value={formData.reason} onChange={e=>setFormData({...formData,reason:e.target.value})}/>
            </>}

            {/* WFH FORM */}
            {activeTab==="WFH" && <>
              <Select value={wfhData.leaveType} onValueChange={(v:any)=>setWfhData({...wfhData,leaveType:v})}>
                <SelectTrigger><SelectValue placeholder="Select Leave Type"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>

              <Input type="date" value={wfhData.startDate} onChange={e=>setWfhData({...wfhData,startDate:e.target.value})}/>
              <Input type="date" value={wfhData.endDate} onChange={e=>setWfhData({...wfhData,endDate:e.target.value})}/>
              <Textarea placeholder="Reason*" value={wfhData.reason} onChange={e=>setWfhData({...wfhData,reason:e.target.value})}/>
            </>}

            <Button className="w-full">Submit</Button>

          </form>
        </DialogContent>
      </Dialog>

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