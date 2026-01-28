import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { internService } from "@/services/internService";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
} from "lucide-react";

/* Year Options  */
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2015;
  const endYear = currentYear + 2;

  const years: string[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(String(y));
  }
  return years;
};

const InternProfile: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.email) {
          const res = await internService.getAll({ limit: 100 });
          const items = Array.isArray(res) ? res : res.items;

          const found = items.find(
            (i: any) =>
              i.email?.toLowerCase() === user.email?.toLowerCase()
          );

          if (found) {
            setProfile(found);
            setLoading(false);
            return;
          }
        }

        // fallback profile
        setProfile({
          name: user?.name || "Demo",
          email: user?.email || "",
          phone: "",
          college: "",
          degree: "",
          branch: "",
          year: "",
          internType: "", // Paid / Unpaid
          isPaid: "",     // Yes / No
          currentProject: "",
          startDate: "",
          joinedDate: "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* =Profile Header = */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name?.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm mt-1">Intern</p>
            </div>

            <Button onClick={() => setEditMode(!editMode)}>
              {editMode ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>
        </Card>

        {/* = Profile Details =*/}
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <Field icon={<User />} label="Name">
              <Input
                name="name"
                value={profile.name}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<Mail />} label="Email">
              <span>{profile.email}</span>
            </Field>

            <Field icon={<Phone />} label="Phone">
              <Input
                name="phone"
                value={profile.phone}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<GraduationCap />} label="College">
              <Input
                name="college"
                value={profile.college}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<GraduationCap />} label="Degree">
              <Input
                name="degree"
                value={profile.degree}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<GraduationCap />} label="Branch">
              <Input
                name="branch"
                value={profile.branch}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>

            {/* -DROPDOWNS - */}
            <Field icon={<Calendar />} label="Year">
              <Select
                name="year"
                value={profile.year}
                editMode={editMode}
                options={getYearOptions()}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<Briefcase />} label="Intern Type">
              <Select
                name="internType"
                value={profile.internType}
                editMode={editMode}
                options={["Paid", "Unpaid"]}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<Briefcase />} label="Is Paid">
              <Select
                name="isPaid"
                value={profile.isPaid}
                editMode={editMode}
                options={["Yes", "No"]}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<Briefcase />} label="Current Project">
              <Select
                name="currentProject"
                value={profile.currentProject}
                editMode={editMode}
                options={[
                  "Internship Management System",
                  "Chatbot",
                  "Dashboard",
                ]}
                onChange={handleChange}
              />
            </Field>

            {/* -------- DATE  -------- */}
            <Field icon={<Calendar />} label="Start Date">
              <DateInput
                name="startDate"
                value={profile.startDate}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>

            <Field icon={<Calendar />} label="Joined Date">
              <DateInput
                name="joinedDate"
                value={profile.joinedDate}
                editMode={editMode}
                onChange={handleChange}
              />
            </Field>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;



const Field = ({ icon, label, children }: any) => (
  <div className="flex gap-3 items-start">
    <div className="mt-1 text-primary">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  </div>
);

const Input = ({ name, value, editMode, onChange }: any) =>
  editMode ? (
    <input
      name={name}
      value={value || ""}
      onChange={onChange}
      className="border rounded px-2 py-1 w-full"
    />
  ) : (
    <span>{value || "Not set"}</span>
  );

const Select = ({ name, value, options, editMode, onChange }: any) =>
  editMode ? (
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="border rounded px-2 py-1 w-full"
    >
      <option value="">Select</option>
      {options.map((o: string) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  ) : (
    <span>{value || "Not set"}</span>
  );

const DateInput = ({ name, value, editMode, onChange }: any) =>
  editMode ? (
    <input
      type="date"
      name={name}
      value={value ? value.substring(0, 10) : ""}
      onChange={onChange}
      className="border rounded px-2 py-1 w-full"
    />
  ) : (
    <span>{value ? new Date(value).toLocaleDateString() : "Not set"}</span>
  );
