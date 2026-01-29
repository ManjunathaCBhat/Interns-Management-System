import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Umbrella, Clock, AlertCircle, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PTORequests: React.FC = () => {
  const { user } = useAuth();

  // --- Greeting Logic----
  const hour = new Date().getHours();
  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  // --Form --
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  
  const clearError = () => {
    if (error) setError("");
  };

  // --- Submit---
  const handleSubmit = () => {
    if (!type || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      setSubmitted(false);

      
      setTimeout(() => {
        setError("");
      }, 3000);

      return;
    }

    setError("");
    setSubmitted(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ===== Header Banner ===== */}
        <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Umbrella className="h-4 w-4" />
            Request PTO / WFH
          </div>

          
          <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
            <Sun className="h-4 w-4" />
            {greeting}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold mt-2">
            {user?.name || "Intern"}!
          </h1>

          <p className="opacity-90 mt-1">
            Plan your time off easily and track approval status
          </p>
        </div>

    
        <Card className="w-full">
          <CardContent className="p-6 space-y-5">

            
            {error && (
              <div className="flex gap-2 bg-red-500 text-white p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Missing fields</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}


            <div className="space-y-1">
              <label className="text-sm font-medium">
                Request Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  clearError();
                }}
                className="w-full border rounded-lg px-3 py-2 text-black"
              >
                <option value="">Select type</option>
                <option value="PTO">PTO (Paid Time Off)</option>
                <option value="WFH">WFH (Work From Home)</option>
              </select>
            </div>

            {/* ===== Dates ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    clearError();
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    clearError();
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-black"
                />
              </div>
            </div>

        
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Reason <span className="text-muted-foreground">(Optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Brief reason for leave..."
                className="w-full border rounded-lg px-3 py-2 text-black"
              />
            </div>

            {/* =success message=*/}
            {submitted && (
              <div className="flex gap-2 bg-purple-50 border border-purple-200 p-3 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                <p className="text-purple-700 text-sm">
                  This request has been sent to the <b>Scrum Master</b> and marked as{" "}
                  <b>Pending</b>.
                </p>
              </div>
            )}

            {/*= Submit Button=*/}
            <Button
              onClick={handleSubmit}
              className="w-full text-white font-semibold py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PTORequests;
