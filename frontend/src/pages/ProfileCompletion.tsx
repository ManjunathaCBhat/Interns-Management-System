import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, GraduationCap, Briefcase, Building, Loader2, Tag, Plus, X, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface InternshipPeriod {
  startDate: string;
  endDate: string;
  type: string;
}

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuth();
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

  const [phoneDeleted, setPhoneDeleted] = useState(false);

  // Form data for missing fields
  const [formData, setFormData] = useState({
    college: '',
    degree: '',
    branch: '',
    passingYear: '',
    primarySkills: '',
    secondarySkills: '',
  });

  // Multiple internship periods
  const [internshipPeriods, setInternshipPeriods] = useState<InternshipPeriod[]>([
    { startDate: '', endDate: '', type: 'Project Intern' }
  ]);

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
  }, [searchParams]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePeriodChange = (index: number, field: keyof InternshipPeriod, value: string) => {
    const updatedPeriods = [...internshipPeriods];
    updatedPeriods[index][field] = value;
    setInternshipPeriods(updatedPeriods);
    setErrors(prev => ({ ...prev, [`period_${index}_${field}`]: '' }));
  };

  const addInternshipPeriod = () => {
    setInternshipPeriods([...internshipPeriods, { startDate: '', endDate: '', type: 'Project Intern' }]);
  };

  const removeInternshipPeriod = (index: number) => {
    if (internshipPeriods.length > 1) {
      setInternshipPeriods(internshipPeriods.filter((_, i) => i !== index));
    }
  };

  const deletePhoneNumber = () => {
    setPhoneDeleted(true);
    setSsoData(prev => ({ ...prev, phone: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate SSO data
    if (!ssoData.firstName.trim() || !ssoData.lastName.trim()) {
      newErrors.name = 'Name is required from SSO';
    }
    if (!ssoData.email.trim()) newErrors.email = 'Email is required from SSO';

    // Validate required form fields
    if (!formData.primarySkills.trim()) newErrors.primarySkills = 'Primary skills are required';
    if (!formData.secondarySkills.trim()) newErrors.secondarySkills = 'Secondary skills are required';

    // Validate internship periods
    internshipPeriods.forEach((period, index) => {
      if (!period.startDate) {
        newErrors[`period_${index}_startDate`] = 'Start date is required';
      }
      if (!period.endDate) {
        newErrors[`period_${index}_endDate`] = 'End date is required';
      }
      if (!period.type) {
        newErrors[`period_${index}_type`] = 'Internship type is required';
      }

      // Date validation
      if (period.startDate && period.endDate) {
        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);

        if (endDate <= startDate) {
          newErrors[`period_${index}_endDate`] = 'End date must be after start date';
        }
      }
    });

    // Validate that the last period's end date is not less than today
    if (internshipPeriods.length > 0) {
      const lastPeriod = internshipPeriods[internshipPeriods.length - 1];
      if (lastPeriod.endDate) {
        const lastEndDate = new Date(lastPeriod.endDate);
        lastEndDate.setHours(0, 0, 0, 0);

        if (lastEndDate < today) {
          newErrors[`period_${internshipPeriods.length - 1}_endDate`] =
            'The end date of your last internship period cannot be in the past. You cannot create an account with an expired internship.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and fix any errors',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Combine SSO data and form data
      const fullName = `${ssoData.firstName} ${ssoData.lastName}`.trim();

      // Combine primary and secondary skills
      const primarySkillsArray = formData.primarySkills
        ? formData.primarySkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const secondarySkillsArray = formData.secondarySkills
        ? formData.secondarySkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const allSkills = [...primarySkillsArray, ...secondarySkillsArray];

      // Use the first period for backward compatibility (or latest period)
      const primaryPeriod = internshipPeriods[0];

      const profileData = {
        // SSO Data
        name: fullName,
        email: ssoData.email,
        phone: phoneDeleted ? undefined : ssoData.phone,
        location: ssoData.location,
        department: ssoData.department,
        position: ssoData.position,
        profilePicture: ssoData.profilePicture,
        azure_oid: ssoData.azureOid,

        // Form Data
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch || undefined,
        year: formData.passingYear ? parseInt(formData.passingYear) : undefined,

        // Internship periods - send first period as primary for backward compatibility
        startDate: primaryPeriod.startDate,
        endDate: primaryPeriod.endDate,
        internType: primaryPeriod.type,
        isPaid: primaryPeriod.type === 'FTE',

        // Additional data
        internshipPeriods: internshipPeriods, // Send all periods for future use
        skills: allSkills,
        primarySkills: primarySkillsArray,
        secondarySkills: secondarySkillsArray,
        organization: ssoData.location || 'Cirrus Labs',
        domain: ssoData.department || undefined,
      };

      const response = await apiClient.post('/auth/sso/complete-profile', profileData);

      // Auto-login after successful registration
      if (response.data.access_token) {
        localStorage.setItem('ilm_token', response.data.access_token);
        localStorage.setItem('ilm_last_activity', Date.now().toString());
        if (response.data.user) {
          localStorage.setItem('ilm_user', JSON.stringify(response.data.user));
        }
      }

      toast({
        title: 'Welcome to Interns360!',
        description: 'Your profile has been created successfully. Check your email for a welcome message.',
      });

      // Redirect directly to dashboard
      setTimeout(() => {
        window.location.href = '/intern/dashboard';
      }, 1000);

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
    <div className="min-h-screen bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#0F0E47] flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl shadow-2xl">
        <CardHeader className="space-y-1 text-center border-b bg-gradient-to-r from-[#0F0E47]/5 to-[#272757]/5 py-4">
          <CardTitle className="text-2xl font-bold text-[#0F0E47]">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-sm">
            Please provide your internship details to complete registration
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2-Column Layout Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* SSO Data Section - Read Only */}
                <div className="bg-gradient-to-r from-[#8686AC]/10 to-[#505081]/5 border-2 border-[#8686AC]/20 rounded-xl p-4 space-y-3">
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
                    <h3 className="text-sm font-bold text-[#0F0E47]">Information from Azure SSO</h3>
                    <span className="text-xs text-[#8686AC] ml-auto">(Read-only)</span>
                  </div>
                  <p className="text-xs text-[#8686AC] mt-1">Profile data fetched from your organization account</p>
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

                {/* Phone - Optional with delete button */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#505081]">
                    Phone (Optional - Personal Info)
                  </Label>
                  <div className="relative">
                    <Input
                      value={phoneDeleted ? '' : ssoData.phone}
                      readOnly
                      placeholder={phoneDeleted ? 'Deleted' : ''}
                      className="bg-white/60 border-[#8686AC]/30 text-[#0F0E47] font-medium pr-10"
                    />
                    {!phoneDeleted && ssoData.phone && (
                      <button
                        type="button"
                        onClick={deletePhoneNumber}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete phone number"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                </div>
              </div>

              <div className="pt-6">
                <h3 className="text-base font-bold text-[#0F0E47] mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#505081]" />
                  Educational Details
                </h3>
              </div>

              {/* Educational Info */}
              <div className="space-y-4">
                {/* College and Year on same line */}
                <div className="grid grid-cols-2 gap-4">
                  {/* College */}
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-sm font-semibold text-[#0F0E47]">
                      College Name (Optional)
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

                  {/* Passing/Passed Year */}
                  <div className="space-y-2">
                    <Label htmlFor="passingYear" className="text-sm font-semibold text-[#0F0E47]">
                      Passing/Passed Year (Optional)
                    </Label>
                    <Input
                      id="passingYear"
                      type="number"
                      value={formData.passingYear}
                      onChange={(e) => handleChange('passingYear', e.target.value)}
                      placeholder="e.g., 2024"
                      className={`border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                        errors.passingYear ? 'border-red-500' : 'border-gray-200'
                      }`}
                      disabled={loading}
                    />
                    {errors.passingYear && <p className="text-xs text-red-500">{errors.passingYear}</p>}
                  </div>
                </div>

                {/* Degree and Branch on same line */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Degree */}
                  <div className="space-y-2">
                    <Label htmlFor="degree" className="text-sm font-semibold text-[#0F0E47]">
                      Degree/Course (Optional)
                    </Label>
                    <Input
                      id="degree"
                      type="text"
                      value={formData.degree}
                      onChange={(e) => handleChange('degree', e.target.value)}
                      placeholder="e.g., MCA, BCA, B.Tech"
                      className="border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20"
                      disabled={loading}
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-sm font-semibold text-[#0F0E47]">
                      Branch (Optional)
                    </Label>
                    <Input
                      id="branch"
                      type="text"
                      value={formData.branch}
                      onChange={(e) => handleChange('branch', e.target.value)}
                      placeholder="e.g., CS, ISE, etc"
                      className="border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Internship Periods */}
              {internshipPeriods.map((period, index) => (
              <div key={index} className={`border-2 border-[#8686AC]/20 rounded-lg p-4 space-y-4 relative ${index === 0 ? 'min-h-[240px]' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  {index === 0 ? (
                    <h3 className="text-base font-bold text-[#0F0E47] flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[#505081]" />
                      Internship Periods
                      <div className="relative group">
                        <Info className="h-4 w-4 text-[#8686AC] cursor-help" />
                        <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-64 p-3 bg-[#0F0E47] text-white text-xs rounded-lg shadow-lg">
                          Add multiple internship periods if you've worked as Project Intern, RS Intern, or FTE at different times
                        </div>
                      </div>
                    </h3>
                  ) : (
                    <h4 className="text-sm font-semibold text-[#0F0E47]">Period {index + 1}</h4>
                  )}
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Button
                        type="button"
                        onClick={addInternshipPeriod}
                        size="sm"
                        variant="outline"
                        className="text-[#0F0E47] border-[#0F0E47] hover:bg-[#0F0E47] hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Period
                      </Button>
                    )}
                    {internshipPeriods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInternshipPeriod(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove this period"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Start and End Date on same line */}
                  <div className={period.type === 'FTE' ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-4'}>
                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor={`startDate_${index}`} className="text-sm font-semibold text-[#0F0E47]">
                        Start Date *
                      </Label>
                      <div className="relative">
                        <Input
                          id={`startDate_${index}`}
                          type="date"
                          value={period.startDate}
                          onChange={(e) => handlePeriodChange(index, 'startDate', e.target.value)}
                          className={`pl-7 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                            errors[`period_${index}_startDate`] ? 'border-red-500' : 'border-gray-200'
                          }`}
                          disabled={loading}
                        />
                        <Calendar className="absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081] pointer-events-none" />
                      </div>
                      {errors[`period_${index}_startDate`] && (
                        <p className="text-xs text-red-500">{errors[`period_${index}_startDate`]}</p>
                      )}
                    </div>

                    {/* End Date - Hidden for FTE */}
                    {period.type !== 'FTE' && (
                      <div className="space-y-2">
                        <Label htmlFor={`endDate_${index}`} className="text-sm font-semibold text-[#0F0E47]">
                          End Date *
                        </Label>
                        <div className="relative">
                          <Input
                            id={`endDate_${index}`}
                            type="date"
                            value={period.endDate}
                            onChange={(e) => handlePeriodChange(index, 'endDate', e.target.value)}
                            min={period.startDate}
                            className={`pl-7 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                              errors[`period_${index}_endDate`] ? 'border-red-500' : 'border-gray-200'
                            }`}
                            disabled={loading}
                          />
                          <Calendar className="absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081] pointer-events-none" />
                        </div>
                        {errors[`period_${index}_endDate`] && (
                          <p className="text-xs text-red-500">{errors[`period_${index}_endDate`]}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Internship Type - Full width below */}
                  <div className="space-y-2">
                    <Label htmlFor={`type_${index}`} className="text-sm font-semibold text-[#0F0E47]">
                      Internship Type *
                    </Label>
                    <Select
                      value={period.type}
                      onValueChange={(value) => handlePeriodChange(index, 'type', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className={`border-2 focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                        errors[`period_${index}_type`] ? 'border-red-500' : 'border-gray-200'
                      }`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Project Intern">Project Intern</SelectItem>
                        <SelectItem value="RS Intern">RS Intern</SelectItem>
                        <SelectItem value="FTE">FTE (Full-Time Employee)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors[`period_${index}_type`] && (
                      <p className="text-xs text-red-500">{errors[`period_${index}_type`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

              {/* Primary Skills */}
              <div className="space-y-2">
                <Label htmlFor="primarySkills" className="text-sm font-semibold text-[#0F0E47]">
                  Primary Skills *
                </Label>
                <div className="relative">
                  <Input
                    id="primarySkills"
                    type="text"
                    value={formData.primarySkills}
                    onChange={(e) => handleChange('primarySkills', e.target.value)}
                    placeholder="e.g., React, Python, Java (comma-separated)"
                    className={`pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                      errors.primarySkills ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081]" />
                </div>
                {errors.primarySkills && <p className="text-xs text-red-500">{errors.primarySkills}</p>}
              </div>

              {/* Secondary Skills */}
              <div className="space-y-2">
                <Label htmlFor="secondarySkills" className="text-sm font-semibold text-[#0F0E47]">
                  Secondary Skills *
                </Label>
                <div className="relative">
                  <Input
                    id="secondarySkills"
                    type="text"
                    value={formData.secondarySkills}
                    onChange={(e) => handleChange('secondarySkills', e.target.value)}
                    placeholder="e.g., Docker, AWS, Git (comma-separated)"
                    className={`pl-10 border-2 transition-all focus:border-[#505081] focus:ring-2 focus:ring-[#8686AC]/20 ${
                      errors.secondarySkills ? 'border-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  />
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505081]" />
                </div>
                {errors.secondarySkills && <p className="text-xs text-red-500">{errors.secondarySkills}</p>}
              </div>
            </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0F0E47] to-[#272757] hover:from-[#272757] hover:to-[#505081] text-white py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Your Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[#505081] mt-6">
            Your account will be created immediately upon submission. Welcome to Interns360!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
