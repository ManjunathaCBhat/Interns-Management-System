// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { userService } from "@/services/UserService";

// const RegisterPage: React.FC = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     username: "",
//     employee_id: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [registrationSuccess, setRegistrationSuccess] = useState(false);

//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     // Clear error when user types
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const validate = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) newErrors.name = "Full name is required";
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email";
//     }
//     if (!formData.username.trim()) {
//       newErrors.username = "Username is required";
//     } else if (formData.username.length < 3) {
//       newErrors.username = "Username must be at least 3 characters";
//     }
//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setLoading(true);
//     try {
//       await userService.register({
//         name: formData.name,
//         email: formData.email.toLowerCase(),
//         username: formData.username.toLowerCase(),
//         password: formData.password,
//         employee_id: formData.employee_id || undefined,
//       });

//       setRegistrationSuccess(true);
//       toast({
//         title: "Registration Successful!",
//         description: "Your account is pending admin approval. You'll be notified once approved.",
//       });
//     } catch (error: any) {
//       console.error("Registration error:", error);
//       let errorMessage = "Registration failed. Please try again.";

//       if (error.response?.data) {
//         const data = error.response.data;
//         if (Array.isArray(data.detail)) {
//           errorMessage = data.detail.map((err: any) => err.msg).join(", ");
//         } else if (typeof data.detail === "string") {
//           errorMessage = data.detail;
//         }
//       }

//       toast({
//         title: "Registration Failed",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Success screen after registration
//   if (registrationSuccess) {
//     return (
//       <div className="min-h-screen flex flex-col lg:flex-row">
//         {/* Left Branding */}
//         <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#505081] text-white p-16 flex-col justify-center">
//           <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
//           <h1 className="text-5xl font-bold">
//             Interns<span className="text-[#8686AC]">360</span>
//           </h1>
//           <p className="mt-6 max-w-md text-lg text-white/90">
//             Manage interns, attendance, standups, and performance in one platform.
//           </p>
//         </div>

//         {/* Right Success Message */}
//         <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
//           <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <UserPlus className="w-8 h-8 text-green-600" />
//             </div>
//             <h2 className="text-2xl font-semibold mb-4">Registration Successful!</h2>
//             <p className="text-gray-600 mb-6">
//               Your account has been created and is pending admin approval. You will be able to login once an administrator approves your account.
//             </p>
//             <button
//               onClick={() => navigate("/login")}
//               className="w-full bg-[#0F0E47] hover:bg-[#272757] text-white py-2.5 rounded-lg font-medium"
//             >
//               Go to Login
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* Left Branding */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#505081] text-white p-16 flex-col justify-center">
//         <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
//         <h1 className="text-5xl font-bold">
//           Interns<span className="text-[#8686AC]">360</span>
//         </h1>
//         <p className="mt-6 max-w-md text-lg text-white/90">
//           Manage interns, attendance, standups, and performance in one platform.
//         </p>
//       </div>

//       {/* Right Registration Form */}
//       <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8">
//         <form
//           onSubmit={handleSubmit}
//           className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
//         >
//           <div className="flex items-center mb-6">
//             <Link
//               to="/login"
//               className="text-gray-500 hover:text-[#0F0E47] mr-3"
//             >
//               <ArrowLeft size={20} />
//             </Link>
//             <h2 className="text-2xl font-semibold">Create Account</h2>
//           </div>

//           {/* Full Name */}
//           <div className="mb-4">
//             <label className="text-sm font-medium">Full Name *</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter your full name"
//               className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
//                 errors.name ? "border-red-500" : "border-gray-300"
//               } focus:ring-[#0F0E47]`}
//             />
//             {errors.name && (
//               <p className="text-xs text-red-500 mt-1">{errors.name}</p>
//             )}
//           </div>

//           {/* Email */}
//           <div className="mb-4">
//             <label className="text-sm font-medium">Email *</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="your.email@company.com"
//               className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
//                 errors.email ? "border-red-500" : "border-gray-300"
//               } focus:ring-[#0F0E47]`}
//             />
//             {errors.email && (
//               <p className="text-xs text-red-500 mt-1">{errors.email}</p>
//             )}
//           </div>

//           {/* Username */}
//           <div className="mb-4">
//             <label className="text-sm font-medium">Username *</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               placeholder="Choose a username"
//               className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
//                 errors.username ? "border-red-500" : "border-gray-300"
//               } focus:ring-[#0F0E47]`}
//             />
//             {errors.username && (
//               <p className="text-xs text-red-500 mt-1">{errors.username}</p>
//             )}
//           </div>

//           {/* Employee ID (Optional) */}
//           <div className="mb-4">
//             <label className="text-sm font-medium">Employee ID (Optional)</label>
//             <input
//               type="text"
//               name="employee_id"
//               value={formData.employee_id}
//               onChange={handleChange}
//               placeholder="e.g., CL001"
//               className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F0E47]"
//             />
//           </div>

//           {/* Password */}
//           <div className="mb-4">
//             <label className="text-sm font-medium">Password *</label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Create a password"
//                 className={`w-full mt-1 px-3 py-2 border rounded-md pr-10 focus:ring-2 ${
//                   errors.password ? "border-red-500" : "border-gray-300"
//                 } focus:ring-[#0F0E47]`}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="text-xs text-red-500 mt-1">{errors.password}</p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div className="mb-6">
//             <label className="text-sm font-medium">Confirm Password *</label>
//             <div className="relative">
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Confirm your password"
//                 className={`w-full mt-1 px-3 py-2 border rounded-md pr-10 focus:ring-2 ${
//                   errors.confirmPassword ? "border-red-500" : "border-gray-300"
//                 } focus:ring-[#0F0E47]`}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//               >
//                 {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             {errors.confirmPassword && (
//               <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
//             )}
//           </div>

//           {/* Register Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-[#0F0E47] hover:bg-[#272757] text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
//           >
//             {loading && <Loader2 className="animate-spin h-4 w-4" />}
//             {loading ? "Creating Account..." : "Create Account"}
//           </button>

//           {/* Info text */}
//           <p className="text-xs text-gray-500 text-center mt-4">
//             Your account will require admin approval before you can login.
//           </p>

//           {/* Login Link */}
//           <p className="text-sm text-center mt-6 text-gray-600">
//             Already have an account?{" "}
//             <Link to="/login" className="text-[#0F0E47] hover:underline font-medium">
//               Login here
//             </Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 - User Details
  const [fullName, setFullName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [email, setEmail] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [internType, setInternType] = useState('');

  // Step 2 - OTP & Password
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Error messages
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for success popup
  useEffect(() => {
    if (showSuccessPopup && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessPopup && countdown === 0) {
      navigate('/login');
    }
  }, [showSuccessPopup, countdown, navigate]);

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isValidPassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!collegeName.trim()) errors.collegeName = 'College name is required';
    if (!degree.trim()) errors.degree = 'Degree is required';
    if (!internType) errors.internType = 'Intern type must be selected';

    // Date validation
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        errors.endDate = 'End date must be later than start date';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};

    if (!otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Step 1 - Proceed to Verification
  const handleProceedToVerification = async () => {
    setErrorMessage('');
    
    if (!validateStep1()) {
      return;
    }

    try {
      setIsLoading(true);

      // Check if email already exists
      const checkEmailResponse = await fetch(`http://localhost:8000/api/v1/users/check-email?email=${email}`);

      const emailData = await checkEmailResponse.json();

      if (emailData.exists) {
        setErrorMessage('This email is already registered. Please use a different email or login.');
        setIsLoading(false);
        return;
      }

      // Send OTP to email
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (otpResponse.ok) {
        setCurrentStep(2);
      } else {
        setErrorMessage('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error in step 1:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2 - Complete Registration
  const handleCompleteRegistration = async () => {
    setErrorMessage('');

    if (!validateStep2()) {
      return;
    }

    try {
      setIsLoading(true);

      // Verify OTP and create user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          startDate,
          endDate,
          email,
          collegeName,
          degree,
          internType,
          otp,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success popup
        setShowSuccessPopup(true);
      } else {
        setErrorMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error in step 2:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setErrorMessage('');
        alert('OTP has been resent to your email');
      } else {
        setErrorMessage('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Interns360
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 1
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 2
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Step 1: User Details */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Details</h2>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your full name"
                />
                {fieldErrors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Internship Dates - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.startDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  />
                  {fieldErrors.startDate && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.endDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  />
                  {fieldErrors.endDate && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID (Company Email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="your.email@company.com"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* College Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.collegeName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your college name"
                />
                {fieldErrors.collegeName && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.collegeName}</p>
                )}
              </div>

              {/* Degree */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.degree ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="e.g., B.Tech Computer Science"
                />
                {fieldErrors.degree && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.degree}</p>
                )}
              </div>

              {/* Intern Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intern Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={internType}
                  onChange={(e) => setInternType(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.internType ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                >
                  <option value="">Select intern type</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                {fieldErrors.internType && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.internType}</p>
                )}
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToVerification}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Proceed to Verification'}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification & Password Setup */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification & Password Setup</h2>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a 6-digit OTP to <strong>{email}</strong>
              </p>

              {/* OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.otp ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-center text-2xl tracking-widest`}
                  placeholder="000000"
                />
                {fieldErrors.otp && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.otp}</p>
                )}
                <button
                  onClick={handleResendOTP}
                  className="text-sm text-purple-600 hover:text-purple-700 mt-2 font-medium"
                >
                  Resend OTP
                </button>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="Enter a strong password"
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 characters with uppercase, lowercase, number & special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="Re-enter your password"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Complete Registration Button */}
              <button
                onClick={handleCompleteRegistration}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              {/* Back Button */}
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                ← Back to User Details
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You will be redirected to the login page in{' '}
              <strong className="text-purple-600">{countdown}</strong> seconds.
            </p>

            {/* Countdown Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 10) * 100}%` }}
              ></div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;

