import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import profileService from "@/services/profileService";
import { projectService } from "@/services/projectService";
import { Skeleton } from "@/components/ui/skeleton";

const InternProfile: React.FC = () => {
  const { user } = useAuth();

  //Edit State 
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //  Access Control 
  // const allowedRoles = ["intern", "scrum master"];
  // const userRole = user?.role?.toLowerCase() || "";
  
  // //check permission
  // const hasAccess = allowedRoles.some(role => userRole.includes(role));
  const allowedRoles = ["intern", "scrum_master"];
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

  //Form State 
  const [startDate, setStartDate] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [mentor, setMentor] = useState("");
  const [phone, setPhone] = useState("");
  const [internType, setInternType] = useState("Intern");
  const [payType, setPayType] = useState("Unpaid");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");

  const [projects, setProjects] = useState<string[]>([]);
  
  // Skills
  const allSkills = ["React", "TypeScript", "SQL", "Node.js", "Python", "Java", "JavaScript"];
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // Form validation
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  //Load Data
  useEffect(() => {
  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      const [response, assignedProjects] = await Promise.all([
        profileService.getMyProfile(),
        projectService.getAssigned(),
      ]);

      console.log('Profile response:', response);
      console.log('Assigned projects:', assignedProjects);

      const projectNames = assignedProjects.map((p) => p.name);
      setProjects(projectNames);

      // Priority: Use backend data from profile service, fallback to AuthContext
      if (response.exists && response.data) {
        const data = response.data;
        console.log('Setting profile data from backend:', data);

        setStartDate(data.startDate || user?.startDate || "");
        setJoinedDate(data.joinedDate || user?.joinedDate || "");
        setEndDate(data.endDate || user?.endDate || "");
        setCurrentProject(data.currentProject || user?.currentProject || "");
        setMentor(data.mentor || user?.mentor || "");
        setPhone(data.phone || user?.phone || "");
        setInternType(data.internType || user?.internType || "Intern");
        setPayType(data.payType || (user?.isPaid ? "Paid" : "Unpaid"));
        setCollege(data.college || user?.college || "");
        setDegree(data.degree || user?.degree || "");
        setSkills(data.skills || user?.skills || []);

        // Add current project to projects list if not already there
        const current = data.currentProject || "";
        if (current && !projectNames.includes(current)) {
          setProjects((prev) => [...prev, current]);
        }
      } else if (user) {
        // Fallback to AuthContext if no backend data
        console.log('Using data from AuthContext');
        setStartDate(user.startDate || "");
        setJoinedDate(user.joinedDate || "");
        setEndDate(user.endDate || "");
        setCurrentProject(user.currentProject || "");
        setMentor(user.mentor || "");
        setPhone(user.phone || "");
        setInternType(user.internType || "Intern");
        setPayType(user.isPaid ? "Paid" : "Unpaid");
        setCollege(user.college || "");
        setDegree(user.degree || "");
        setSkills(user.skills || []);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      setErrorMessage("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.id) {
    loadProfileData();
  } else {
    setIsLoading(false);
  }
}, [user?.id]);

  
  const getInitials = (name?: string) => {
    if (!name) return "IN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalizeRole = (role?: string) => {
    if (!role) return "Intern";
    return role
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const addSkill = () => {
    if (selectedSkill && !skills.includes(selectedSkill)) {
      setSkills([...skills, selectedSkill]);
    }
    setSelectedSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const validateForm = () => {
    if (!startDate || !joinedDate || !endDate || !currentProject || !mentor ||
        skills.length === 0 || !phone || !college || !degree) {
      return "Please fill all the required details";
    }

    // Validate phone number - should contain only digits, spaces, +, -, (, )
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number";
    }

    // Check if phone has at least 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return "Phone number must contain at least 10 digits";
    }

    return null;
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  

  const handleCancel = async () => {
  setErrorMessage("");
  setSuccessMessage("");
  setIsEditMode(false);

  // Reload data from backend
  try {
    const response = await profileService.getMyProfile();
    
    if (response.exists && response.data) {
      const data = response.data;
      setStartDate(data.startDate || "");
      setJoinedDate(data.joinedDate || "");
      setEndDate(data.endDate || "");
      setCurrentProject(data.currentProject || "");
      setMentor(data.mentor || "");
      setPhone(data.phone || "");
      setInternType(data.internType || "Intern");
      setPayType(data.payType || "Unpaid");
      setCollege(data.college || "");
      setDegree(data.degree || "");
      setSkills(data.skills || []);
    }
  } catch (error) {
    console.error("Error reloading profile:", error);
  }
};

  const handleSave = async () => {
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

  // Prepare profile data
  const profileData = {
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
  };

  try {
    // Save to backend
    const response = await profileService.updateMyProfile(profileData);
    
    if (response.success) {
      setSuccessMessage("Profile updated successfully!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        setSuccessMessage("");
        setIsEditMode(false);
      }, 3000);
    }
  } catch (error: any) {
    console.error("Error saving profile:", error);
    const errorMsg = error.response?.data?.detail || "Failed to save profile. Please try again.";
    setErrorMessage(errorMsg);
    setTimeout(() => setErrorMessage(""), 5000);
  }
};

  //Loading 
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Skeleton className="h-96 w-full lg:col-span-2" />
            <Skeleton className="h-96 w-full lg:col-span-3" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  
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

          {/* header section */}
        <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-[#1e1145] via-[#2d1b69] to-[#1e1145] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-teal-500 flex items-center justify-center text-2xl font-bold shadow-lg">
              {getInitials(user?.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.name || "Intern Name"}</h1>
              {(user as any)?.employeeId && (
                <p className="text-lg opacity-90 mt-1">Employee ID: #{(user as any).employeeId}</p>
              )}
              <p className="opacity-80 mt-1">{capitalizeRole(user?.role)}</p>
            </div>
          </div>
          
          {!isEditMode && (
            <button
              onClick={handleEdit}
              className="px-6 py-2.5 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md flex items-center gap-2"
            >
              <span>✏️</span> Edit Profile
            </button>
          )}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Panel - Education Timeline */}
          <Card className="lg:col-span-1 shadow-md bg-gradient-to-br from-[#1e1145] via-[#2d1b69] to-[#1e1145] border-0">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-8">Education</h2>

              {isEditMode ? (
                <div className="space-y-6">
                  {/* Edit mode - Simple form */}
                  <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        College <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                        placeholder="Enter college name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        Degree <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                        placeholder="e.g., Master of Computer Applications"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        Start Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        End Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        Joined Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={joinedDate}
                        onChange={(e) => setJoinedDate(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        Current Project <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={currentProject}
                        onChange={(e) => setCurrentProject(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="" className="bg-slate-800">Select project</option>
                        {projects.map((project) => (
                          <option key={project} value={project} className="bg-slate-800">{project}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-1">
                        Mentor <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={mentor}
                        onChange={(e) => setMentor(e.target.value)}
                        className="w-full border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                        placeholder="Enter mentor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-2">
                        Skills <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={selectedSkill}
                          onChange={(e) => setSelectedSkill(e.target.value)}
                          className="flex-1 border border-cyan-500/30 bg-slate-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          <option value="" className="bg-slate-800">Select skill</option>
                          {allSkills.map((skill) => (
                            <option key={skill} value={skill} className="bg-slate-800">{skill}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-red-400 hover:text-red-300 font-bold text-lg leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* View mode - Beautiful Timeline - Education & Internship Period */}
                  <div className="relative pl-8 space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-transparent"></div>

                    {/* Timeline Item 1 - Education */}
                    <div className="relative">
                      {/* Circle Dot */}
                      <div className="absolute -left-[26px] top-2 w-5 h-5 rounded-full bg-[#fbbf24] border-4 border-[#1e1145] shadow-lg shadow-[#fbbf24]/50"></div>

                      <div className="bg-[#2d1b69]/40 backdrop-blur-sm border border-[#fbbf24]/30 rounded-xl p-5 hover:border-[#fbbf24]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#fbbf24]/20">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{degree || 'Degree Not Set'}</h3>
                          <span className="px-3 py-1 bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-semibold rounded-full border border-[#f59e0b]/30">
                            {endDate ? new Date(endDate).getFullYear() : 'Current'}
                          </span>
                        </div>
                        <p className="text-[#fbbf24] text-sm font-medium mb-1">{college || 'College Not Set'}</p>
                        {startDate && endDate && (
                          <p className="text-gray-300 text-xs">
                            {formatDate(startDate)} - {formatDate(endDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timeline Item 2 - Internship Period */}
                    <div className="relative">
                      {/* Circle Dot */}
                      <div className="absolute -left-[26px] top-2 w-5 h-5 rounded-full bg-[#10b981] border-4 border-[#1e1145] shadow-lg shadow-[#10b981]/50"></div>

                      <div className="bg-[#2d1b69]/40 backdrop-blur-sm border border-[#10b981]/30 rounded-xl p-5 hover:border-[#10b981]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#10b981]/20">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white">Internship Period</h3>
                          {joinedDate && (
                            <span className="px-3 py-1 bg-[#10b981]/30 text-[#10b981] text-xs font-semibold rounded-full border border-[#059669]/40">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Start Date:</span>
                            <span className="text-white font-semibold">{joinedDate ? formatDate(joinedDate) : 'Not Set'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">End Date:</span>
                            <span className="text-white font-semibold">{endDate ? formatDate(endDate) : 'Not Set'}</span>
                          </div>
                          {joinedDate && endDate && (
                            <div className="pt-2 mt-2 border-t border-[#505081]/30">
                              <div className="flex justify-between items-center">
                                <span className="text-[#10b981] font-medium">Duration:</span>
                                <span className="text-[#10b981] font-bold">
                                  {Math.ceil((new Date(endDate).getTime() - new Date(joinedDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Internship, Skills & Contact Details */}
          <Card className="lg:col-span-2 shadow-md">
            <CardContent className="p-6 space-y-6">

              {!isEditMode && (
                <>
                  {/* Internship Info Section - Orange theme from login */}
                  <div className="bg-gradient-to-br from-[#f97316]/20 via-[#ea580c]/10 to-[#f97316]/20 border-2 border-[#f97316] rounded-xl p-6 shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-[#ea580c]">Internship at Consoleflare</h3>
                      {joinedDate && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-bold rounded-full shadow-md">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-[#f97316]/30">
                        <p className="text-[#ea580c] font-semibold mb-1">Project</p>
                        <p className="text-gray-900 font-bold text-base">{currentProject || 'N/A'}</p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-[#f97316]/30">
                        <p className="text-[#ea580c] font-semibold mb-1">Mentor</p>
                        <p className="text-gray-900 font-bold text-base">{mentor || 'N/A'}</p>
                      </div>
                      {joinedDate && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-[#f97316]/30">
                          <p className="text-[#ea580c] font-semibold mb-1">Joined Date</p>
                          <p className="text-[#f97316] font-bold text-base">{formatDate(joinedDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Section - Purple theme from login */}
                  <div className="bg-gradient-to-br from-[#505081]/20 via-[#272757]/10 to-[#505081]/20 border-2 border-[#505081] rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-[#272757] mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-3">
                      {skills.length > 0 ? (
                        skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-5 py-2.5 text-sm bg-gradient-to-r from-[#505081] to-[#272757] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-[#505081] text-sm font-medium">No skills added yet</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Contact & Work Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Contact & Work Details</h2>

                {isEditMode ? (
                  <>
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

                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-base text-gray-900 mt-1">{user?.name || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-base text-gray-900 mt-1">{user?.email || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone</p>
                        <p className="text-base text-gray-900 mt-1">{phone || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600">Intern Type</p>
                        <p className="text-base text-gray-900 mt-1">{internType || "N/A"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons  */}
        {isEditMode && (
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              Save Profile
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternProfile;