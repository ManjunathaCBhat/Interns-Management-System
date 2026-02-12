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

  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error 
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
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

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

      setOtpError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
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

        {/* Left Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#505081] text-white p-16 flex-col justify-center">
          <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
          <h1 className="text-5xl font-bold">
            Interns<span className="text-[#8686AC]">360</span>
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
            <h2 className="text-2xl font-semibold mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created and is pending admin approval. You will be able to login once an administrator approves your account.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#605081] hover:bg-[#0F0E47] text-white py-2.5 rounded-lg font-medium transition-colors"
              className="w-full bg-[#0F0E47] hover:bg-[#272757] text-white py-2.5 rounded-lg font-medium"
            >
              Go to Login
            </button>
          </div>

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding  */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#272757] via-[#8686AD] to-[#0F0E47] text-white p-16 flex-col justify-center">
        <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
        <h1 className="text-5xl font-bold">
          Interns<span className="text-[#8686AD]">360</span>
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#505081] text-white p-16 flex-col justify-center">
        <img src="/cirrus-logo.png" className="w-36 mb-10" alt="Logo" />
        <h1 className="text-5xl font-bold">
          Interns<span className="text-[#8686AC]">360</span>
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
              className="text-gray-500 hover:text-[#0F0E47] mr-3"
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
              } focus:ring-[#0F0E47]`}
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
              } focus:ring-[#0F0E47]`}
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
              } focus:ring-[#0F0E47]`}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
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
                } focus:ring-[#0F0E47]`}
              />
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

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F0E47] hover:bg-[#272757] text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? "Processing..." : "Register"}
          </button>

          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your account will require admin approval before you can login.
          </p>

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

