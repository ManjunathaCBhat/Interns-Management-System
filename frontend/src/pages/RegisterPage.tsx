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
//         <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2D0B59] via-[#5B1AA6] to-[#7C3AED] text-white p-16 flex-col justify-center">
//           <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
//           <h1 className="text-5xl font-bold">
//             Interns<span className="text-pink-400">360</span>
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
//               className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium"
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
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2D0B59] via-[#5B1AA6] to-[#7C3AED] text-white p-16 flex-col justify-center">
//         <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
//         <h1 className="text-5xl font-bold">
//           Interns<span className="text-pink-400">360</span>
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
//               className="text-gray-500 hover:text-purple-600 mr-3"
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
//               } focus:ring-purple-500`}
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
//               } focus:ring-purple-500`}
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
//               } focus:ring-purple-500`}
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
//               className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
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
//                 } focus:ring-purple-500`}
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
//                 } focus:ring-purple-500`}
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
//             className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
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
//             <Link to="/login" className="text-purple-600 hover:underline font-medium">
//               Login here
//             </Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;





import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/UserService";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    employee_id: "",
    startDate: "",
    endDate: "",
    joinedDate: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // OTP 
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error 
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.joinedDate) newErrors.joinedDate = "Joined date is required";
    
    // Date validation
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate OTP
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP 
  const sendOtpEmail = async (email: string, otpCode: string) => {
    console.log(`📧 Sending OTP ${otpCode} to ${email}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // show OTP
    console.log('='.repeat(50));
    console.log('📧 OTP VERIFICATION EMAIL');
    console.log('='.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Your verification code is: ${otpCode}`);
    console.log('This code will expire in 10 minutes.');
    console.log('='.repeat(50));
    
    toast({
      title: "OTP Sent!",
      description: `For testing: Your OTP is ${otpCode}. Check console for details.`,
    });
  };

  // Check if email exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/users/check-email?email=${email}`
      );
      
      if (response.status === 404) return false;
      
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.log('Email check endpoint not available, proceeding...');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        setErrors({ email: 'This email is already registered' });
        toast({
          title: "Email Already Exists",
          description: "An account with this email already exists. Please login instead.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate and send OTP
      const otpCode = generateOTP();
      setGeneratedOtp(otpCode);
      
      await sendOtpEmail(formData.email, otpCode);
      
      // Show OTP 
      setShowOtpModal(true);
      setLoading(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP 
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
  };

  // Handle OTP 
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP and complete registration
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    // Verify OTP
    if (enteredOtp !== generatedOtp) {
      setOtpError('Invalid verification code. Please try again.');
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
      return;
    }

    setOtpLoading(true);

    try {
      await userService.register({
        name: formData.name,
        email: formData.email.toLowerCase(),
        username: formData.username.toLowerCase(),
        password: formData.password,
        employee_id: formData.employee_id || undefined,
      });

      setShowOtpModal(false);
      setRegistrationSuccess(true);
      
      toast({
        title: "Registration Successful!",
        description: "Your account is pending admin approval. You'll be notified once approved.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data) {
        const data = error.response.data;
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg).join(", ");
        } else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        }
      }

      setOtpError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    await sendOtpEmail(formData.email, newOtp);
    
    
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    document.getElementById('otp-0')?.focus();
  };

  // Success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Branding - Blue Eclipse Theme */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#272757] via-[#8686AD] to-[#0F0E47] text-white p-16 flex-col justify-center">
          <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
          <h1 className="text-5xl font-bold">
            Interns<span className="text-[#8686AD]">360</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/90">
            Manage interns, attendance, standups, and performance in one platform.
          </p>
        </div>

        {/* Right Success Message */}
        <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created and is pending admin approval. You will be able to login once an administrator approves your account.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#605081] hover:bg-[#0F0E47] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding  */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#272757] via-[#8686AD] to-[#0F0E47] text-white p-16 flex-col justify-center">
        <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
        <h1 className="text-5xl font-bold">
          Interns<span className="text-[#8686AD]">360</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/90">
          Manage interns, attendance, standups, and performance in one platform.
        </p>
      </div>

      {/* Right Registration Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <Link
              to="/login"
              className="text-gray-500 hover:text-[#605081] mr-3"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-2xl font-semibold">Create Account</h2>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="text-sm font-medium">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-[#605081]`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-medium">Email ID *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@company.com"
              className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-[#605081]`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="text-sm font-medium">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                errors.username ? "border-red-500" : "border-gray-300"
              } focus:ring-[#605081]`}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Employee ID (Optional) */}
          <div className="mb-4">
            <label className="text-sm font-medium">Employee ID (Optional)</label>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              placeholder="e.g., CL001"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#605081]"
            />
          </div>

          {/* Date Fields  */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Start Date */}
            <div>
              <label className="text-sm font-medium">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                } focus:ring-[#605081]`}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="text-sm font-medium">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                } focus:ring-[#605081]`}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Joined Date */}
          <div className="mb-4">
            <label className="text-sm font-medium">Joined Date *</label>
            <input
              type="date"
              name="joinedDate"
              value={formData.joinedDate}
              onChange={handleChange}
              className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                errors.joinedDate ? "border-red-500" : "border-gray-300"
              } focus:ring-[#605081]`}
            />
            {errors.joinedDate && (
              <p className="text-xs text-red-500 mt-1">{errors.joinedDate}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-sm font-medium">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full mt-1 px-3 py-2 border rounded-md pr-10 focus:ring-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:ring-[#605081]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="text-sm font-medium">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full mt-1 px-3 py-2 border rounded-md pr-10 focus:ring-2 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } focus:ring-[#605081]`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#605081] hover:bg-[#0F0E47] text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? "Processing..." : "Register"}
          </button>

          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your account will require admin approval before you can login.
          </p>

          {/* Login Link */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-[#605081] hover:underline font-medium">
              Login here
            </Link>
          </p>
        </form>
      </div>

      {/* OTP Verification  */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#8686AD]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#605081]" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Email Verification</h2>
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit code to<br />
                <span className="font-semibold text-gray-900">{formData.email}</span>
              </p>
            </div>

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {otpError}
              </div>
            )}

            <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#605081] focus:ring-2 focus:ring-[#8686AD]/20 outline-none transition-colors"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              className="w-full bg-[#605081] hover:bg-[#0F0E47] text-white py-2.5 rounded-lg font-medium mb-3 flex items-center justify-center gap-2 transition-colors"
            >
              {otpLoading && <Loader2 className="animate-spin h-4 w-4" />}
              {otpLoading ? 'Verifying...' : 'Verify & Register'}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-sm text-[#605081] hover:text-[#0F0E47] font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : 'Resend code'}
              </button>
            </div>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full text-sm text-gray-600 hover:text-gray-800 mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
