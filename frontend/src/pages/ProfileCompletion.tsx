import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, GraduationCap, Briefcase, Building, Loader2, MapPin, Phone, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // SSO Data (pre-filled, read-only)
  const [ssoData, setSsoData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    position: '',
    profilePicture: '',  // Base64 image
    azureOid: '',
  });

  // Form data for missing fields
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    college: '',
    degree: '',
    branch: '',
    year: '',
    cgpa: '',
    internType: 'unpaid',
    isPaid: false,
    skills: '',
    batch: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get SSO data from URL params or sessionStorage
  useEffect(() => {
    // Try URL params first
    const firstName = searchParams.get('firstName') || searchParams.get('first_name') || '';
    const lastName = searchParams.get('lastName') || searchParams.get('last_name') || '';
    const email = searchParams.get('email') || '';
    const phone = searchParams.get('phone') || searchParams.get('phoneNumber') || '';
    const location = searchParams.get('location') || searchParams.get('officeLocation') || '';
    const department = searchParams.get('department') || '';
    const position = searchParams.get('position') || searchParams.get('jobTitle') || '';
    const azureOid = searchParams.get('azureOid') || searchParams.get('azure_oid') || '';

    // Profile picture might be too large for URL, check sessionStorage
    let profilePicture = searchParams.get('profilePicture') || '';
    if (!profilePicture) {
      const storedPicture = sessionStorage.getItem('sso_profile_picture');
      if (storedPicture) {
        profilePicture = storedPicture;
        sessionStorage.removeItem('sso_profile_picture'); // Clean up
      }
    }

    setSsoData({
      firstName,
      lastName,
      email,
      phone,
      location,
      department,
      position,
      profilePicture,
      azureOid,
    });

    // Pre-fill internType from position if available
    if (position.toLowerCase().includes('paid')) {
      setFormData(prev => ({ ...prev, internType: 'paid', isPaid: true }));
    }
  }, [searchParams]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate SSO data
    if (!ssoData.firstName.trim() || !ssoData.lastName.trim()) {
      newErrors.name = 'Name is required from SSO';
    }
    if (!ssoData.email.trim()) newErrors.email = 'Email is required from SSO';

    // Validate required form fields
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.college.trim()) newErrors.college = 'College name is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // CGPA validation (if provided)
    if (formData.cgpa && (parseFloat(formData.cgpa) < 0 || parseFloat(formData.cgpa) > 10)) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Combine SSO data and form data
      const fullName = `${ssoData.firstName} ${ssoData.lastName}`.trim();
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const profileData = {
        // SSO Data
        name: fullName,
        email: ssoData.email,
        phone: ssoData.phone,
        location: ssoData.location,
        department: ssoData.department,
        position: ssoData.position,
        profilePicture: ssoData.profilePicture, // Base64 image
        azure_oid: ssoData.azureOid,

        // Form Data
        startDate: formData.startDate,
        endDate: formData.endDate,
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        internType: formData.internType,
        isPaid: formData.isPaid,
        skills: skillsArray,
        batch: formData.batch || undefined,
        organization: ssoData.location || 'Cirrus Labs', // Use location as organization
        domain: ssoData.department || undefined, // Map department to domain
      };

      const response = await apiClient.post('/auth/sso/complete-profile', profileData);

      toast({
        title: 'Profile Submitted!',
        description: 'Your profile has been submitted for admin approval.',
      });

      // Redirect to pending approval page
      navigate('/pending-approval', { replace: true });
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.detail || 'Failed to submit profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#0F0E47] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-2 text-center border-b bg-gradient-to-r from-[#0F0E47]/5 to-[#272757]/5">
          <CardTitle className="text-3xl font-bold text-[#0F0E47]">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-base">
            Please provide your internship details to complete registration
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SSO Data Section - Read Only */}
            <div className="bg-gradient-to-r from-[#8686AC]/10 to-[#505081]/5 border-2 border-[#8686AC]/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                {/* Profile Picture */}
                {ssoData.profilePicture ? (
                  <img
                    src={ssoData.profilePicture}
                    alt={`${ssoData.firstName} ${ssoData.lastName}`}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0F0E47] to-[#505081] flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                    {ssoData.firstName.charAt(0)}{ssoData.lastName.charAt(0)}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#505081]/10">
                      <Briefcase className="h-4 w-4 text-[#505081]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0F0E47]">Information from SSO</h3>
                    <span className="text-xs text-[#8686AC] ml-auto">(Read-only)</span>
                  </div>
                  <p className="text-xs text-[#8686AC] mt-1">Profile data from your organization account</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">Full Name</Label>
                  <Input
                    value={`${ssoData.firstName} ${ssoData.lastName}`}
                    readOnly
                    className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">Email</Label>
                  <Input
                    value={ssoData.email}
                    readOnly
                    className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">Phone</Label>
                  <Input
                    value={ssoData.phone}
                    readOnly
                    className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">Location</Label>
                  <Input
                    value={ssoData.location}
                    readOnly
                    className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">Department</Label>
                  <Input
                    value={ssoData.department}
                    readOnly
                    className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium"
                  />
                </div>

                {/* Position */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">Position</Label>
                  <Input
                    value={ssoData.position}
                    readOnly
                    className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#8686AC]/20 pt-6">
              <h3 className="text-base font-bold text-[#0F0E47] mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#505081]" />
                Complete Your Internship Details
              </h3>
            </div>

            {/* Internship Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-[#0F0E47]">
                  Start Date *
                </Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081] pointer-events-none" />
                </div>
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold text-[#0F0E47]">
                  End Date *
                </Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className={`pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081] pointer-events-none" />
                </div>
                {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
              </div>
            </div>

            {/* Educational Info */}
            <div className="grid grid-cols-2 gap-4">
              {/* College */}
              <div className="space-y-2">
                <Label htmlFor="college" className="text-sm font-semibold text-[#0F0E47]">
                  College Name *
                </Label>
                <div className="relative">
                  <Input
                    id="college"
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    placeholder="Enter college name"
                    className={`pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                      errors.college ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081]" />
                </div>
                {errors.college && <p className="text-xs text-red-500">{errors.college}</p>}
              </div>

              {/* Degree */}
              <div className="space-y-2">
                <Label htmlFor="degree" className="text-sm font-semibold text-[#0F0E47]">
                  Degree *
                </Label>
                <div className="relative">
                  <Input
                    id="degree"
                    type="text"
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    placeholder="e.g., B.Tech, MCA, BCA"
                    className={`pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                      errors.degree ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081]" />
                </div>
                {errors.degree && <p className="text-xs text-red-500">{errors.degree}</p>}
              </div>
            </div>

            {/* Branch, Year, CGPA */}
            <div className="grid grid-cols-3 gap-4">
              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-sm font-semibold text-[#0F0E47]">
                  Branch
                </Label>
                <Input
                  id="branch"
                  type="text"
                  value={formData.branch}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  placeholder="e.g., CSE, IT"
                  className="border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20"
                  disabled={loading}
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-semibold text-[#0F0E47]">
                  Year
                </Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleChange('year', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="border-2 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CGPA */}
              <div className="space-y-2">
                <Label htmlFor="cgpa" className="text-sm font-semibold text-[#0F0E47]">
                  CGPA
                </Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => handleChange('cgpa', e.target.value)}
                  placeholder="e.g., 8.5"
                  className={`border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                    errors.cgpa ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={loading}
                />
                {errors.cgpa && <p className="text-xs text-red-500">{errors.cgpa}</p>}
              </div>
            </div>

            {/* Intern Type and Batch */}
            <div className="grid grid-cols-2 gap-4">
              {/* Intern Type */}
              <div className="space-y-2">
                <Label htmlFor="internType" className="text-sm font-semibold text-[#0F0E47]">
                  Intern Type *
                </Label>
                <Select
                  value={formData.internType}
                  onValueChange={(value) => {
                    handleChange('internType', value);
                    handleChange('isPaid', value === 'paid' ? 'true' : 'false');
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="border-2 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid Internship</SelectItem>
                    <SelectItem value="unpaid">Unpaid Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch */}
              <div className="space-y-2">
                <Label htmlFor="batch" className="text-sm font-semibold text-[#0F0E47]">
                  Batch (Optional)
                </Label>
                <Input
                  id="batch"
                  type="text"
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  placeholder="e.g., 2024-Q1"
                  className="border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-sm font-semibold text-[#0F0E47]">
                Skills (Optional)
              </Label>
              <div className="relative">
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  placeholder="e.g., React, Python, Java (comma-separated)"
                  rows={3}
                  className="pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 resize-none"
                  disabled={loading}
                />
                <Tag className="absolute left-3 top-3 h-4 w-4 text-[#505081]" />
              </div>
              <p className="text-xs text-[#8686AC]">Separate multiple skills with commas</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0F0E47] to-[#272757] hover:from-[#272757] hover:to-[#505081] text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Profile'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[#505081] mt-6">
            Your profile will be reviewed by an administrator before you can access the system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
