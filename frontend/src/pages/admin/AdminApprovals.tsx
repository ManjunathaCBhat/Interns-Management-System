import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Users, Clock, Home } from "lucide-react";

interface Approval {
  _id: string;
  name?: string;
  email?: string;
  created_at?: string;
  type: string;
  status: string;
}

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 AUTO PICK TOKEN (access_token OR token)
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  console.log("ADMIN TOKEN:", token);

  // ================= LOAD =================
  const load = async () => {
    if (!token) {
      toast.error("Admin token missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/admin/approvals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("APPROVAL RESPONSE 👉", res.data);
      setApprovals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  // reload when token appears
  useEffect(() => {
    load();
  }, [token]);

  // ================= UPDATE =================
  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/admin/approvals/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Updated");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= SEARCH =================
  const filtered = approvals.filter((a) => {
    if (!search) return true;
    return (
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  // ================= KPI =================
  const users = approvals.filter((a) => a.type === "USER");
  const pto = approvals.filter((a) => a.type === "PTO");
  const wfh = approvals.filter((a) => a.type === "WFH");

  const count = (arr: Approval[], status: string) =>
    arr.filter((a) => a.status === status).length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Approvals</h1>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl p-4 flex gap-4">
          <Users />
          <div>
            <p>User Approval</p>
            <p>Pending: {count(users, "pending")}</p>
            <p>Approved: {count(users, "approved")}</p>
            <p>Rejected: {count(users, "rejected")}</p>
          </div>
        </div>

        <div className="border rounded-xl p-4 flex gap-4">
          <Clock />
          <div>
            <p>PTO Approval</p>
            <p>Pending: {count(pto, "pending")}</p>
            <p>Approved: {count(pto, "approved")}</p>
            <p>Rejected: {count(pto, "rejected")}</p>
          </div>
        </div>

        <div className="border rounded-xl p-4 flex gap-4">
          <Home />
          <div>
            <p>WFH Approval</p>
            <p>Pending: {count(wfh, "pending")}</p>
            <p>Approved: {count(wfh, "approved")}</p>
            <p>Rejected: {count(wfh, "rejected")}</p>
          </div>
        </div>
      </div>

      <Input
        placeholder="Search name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Date</th>
              <th className="p-3">Request Type</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr key={a._id} className="border-t text-center">
                <td className="p-3">{a.name || "Unknown"}</td>
                <td className="p-3">{a.email || "-"}</td>
                <td className="p-3">
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3">{a.type}</td>

                <td className="p-3 space-x-2">
                  {a.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(a._id, "approved")}
                      >
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(a._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="capitalize">{a.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}