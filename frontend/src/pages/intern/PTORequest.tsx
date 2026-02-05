import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ptoService, PTORequest as PTORequestType } from '@/services/ptoService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from "react-router-dom";
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
import PageLoader from '@/components/shared/PageLoader';
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
  reason: string;
  startDate: string;
  endDate: string;
}

const PTORequest: React.FC = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

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
    reason: '',
    startDate: '',
    endDate: '',
  });

  const fetchRequests = async () => {
    const data = await ptoService.getAll();
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
      await ptoService.create({
        internId: user.id,
        name: user.name,
        email: user.email,
        team: 'Engineering',
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
    }

    if (activeTab === "WFH") {
      setOpen(false);
      alert("WFH request submitted (demo)");
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

  if (loading) return <DashboardLayout><PageLoader message="Loading PTO..." /></DashboardLayout>;

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
                  <span className="w-3 h-3 rounded-full bg-pink-500"></span> Rejected
                </span>
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={tab==="PTO"?toCalendarEvents(requests):[]}
                nowIndicator
                height="550px"
                aspectRatio={1.8}
                dayMaxEventRows={1}
                dayCellClassNames={(arg)=>arg.isToday?['bg-purple-200','border','border-purple-600']:[]}
                dateClick={(info:any)=>{
                  if(isPastDate(info.dateStr)){
                    setError("The selected day is over");
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

            {/* PTO DROPDOWN RESTORED */}
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
              <Textarea placeholder="Reason" value={formData.reason} onChange={e=>setFormData({...formData,reason:e.target.value})}/>
            </>}

            {/* WFH TEXT BOX */}
            {activeTab==="WFH" && <>
              <Input placeholder="Reason" value={wfhData.reason} onChange={e=>setWfhData({...wfhData,reason:e.target.value})}/>
              <Input type="date" value={wfhData.startDate} onChange={e=>setWfhData({...wfhData,startDate:e.target.value})}/>
              <Input type="date" value={wfhData.endDate} onChange={e=>setWfhData({...wfhData,endDate:e.target.value})}/>
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