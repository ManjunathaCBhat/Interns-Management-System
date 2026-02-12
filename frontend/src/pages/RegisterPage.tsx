import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/UserService";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    employee_id: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await userService.register({
        name: formData.name,
        email: formData.email.toLowerCase(),
        username: formData.username.toLowerCase(),
        password: formData.password,
        employee_id: formData.employee_id || undefined,
      });

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

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
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
              className="w-full bg-[#0F0E47] hover:bg-[#272757] text-white py-2.5 rounded-lg font-medium"
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
              } focus:ring-[#0F0E47]`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@company.com"
              className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
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
              } focus:ring-[#0F0E47]`}
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
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F0E47]"
            />
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
                } focus:ring-[#0F0E47]`}
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
            className="w-full bg-[#0F0E47] hover:bg-[#272757] text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your account will require admin approval before you can login.
          </p>

          {/* Login Link */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0F0E47] hover:underline font-medium">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

