import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const InternProfile: React.FC = () => {
  const { user } = useAuth();

  
  const allowedRoles = ["intern", "scrum master"];
  const userRole = user?.role?.toLowerCase() || "";
  
 
  const hasAccess = allowedRoles.some(role => userRole.includes(role));

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
              <p className="text-gray-600">
                This page is only accessible to Interns and Scrum Masters.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  

  // Timeline fields
  const [startDate, setStartDate] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [mentor, setMentor] = useState("");

  // Contact details
  const [phone, setPhone] = useState("");
  const [internType, setInternType] = useState("Intern");
  const [payType, setPayType] = useState("Unpaid");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");

  // Skills
  const allSkills = ["React", "TypeScript", "SQL", "Node.js", "Python", "Java", "JavaScript"];
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  

  const addSkill = () => {
    if (selectedSkill && !skills.includes(selectedSkill)) {
      setSkills([...skills, selectedSkill]);
    }
    setSelectedSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const getInitials = (name?: string) => {
    if (!name) return "IN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const validateForm = () => {
    
    if (!startDate || !joinedDate || !endDate || !currentProject || !mentor || 
        skills.length === 0 || !phone || !college || !degree) {
      return "Please fill all the required details";
    }
    
    return null; 
  };

  const handleSubmit = () => {
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    
    if (validationError) {
      setErrorMessage(validationError);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return;
    }

    
    console.log("Form data:", {
      startDate,
      joinedDate,
      endDate,
      currentProject,
      mentor,
      skills,
      phone,
      internType,
      payType,
      college,
      degree
    });

    setSuccessMessage("Profile updated successfully!");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
   
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

 

  return (
    <DashboardLayout>
      <div className="space-y-6">

       
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl font-bold">⚠</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-500 text-xl font-bold">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        
        <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-slate-900 via-blue-900 to-teal-700 flex items-center gap-6">
          
          <div className="h-20 w-20 rounded-full bg-teal-500 flex items-center justify-center text-2xl font-bold shadow-lg">
            {getInitials(user?.name)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name || "Intern Name"}</h1>
            {(user as any)?.employeeId && (
              <p className="text-lg opacity-90 mt-1">Employee ID: #{(user as any).employeeId}</p>
            )}
            <p className="opacity-80 mt-1">{user?.role || "Intern"}</p>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* --- Left Panel --- */}
          <Card className="lg:col-span-2 shadow-md">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Profile Timeline</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={joinedDate}
                  onChange={(e) => setJoinedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Project <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mentor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mentor}
                  onChange={(e) => setMentor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mentor name"
                  required
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select skill</option>
                    {allSkills.map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---Right Panel --- */}
          <Card className="lg:col-span-3 shadow-md">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Contact Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intern Type</label>
                  <select
                    value={internType}
                    onChange={(e) => setInternType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Intern</option>
                    <option>Full Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Paid</option>
                    <option>Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter college name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter degree"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---Submit Button ---*/}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
          >
            Save Profile
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;
