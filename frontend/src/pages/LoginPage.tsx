import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAzureLoginUrl } from "@/config/azure";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------ Login ------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You have logged in successfully.",
      });

      const stored = localStorage.getItem("ilm_user");
      if (stored) {
        const user = JSON.parse(stored);
        navigate(user.role === "admin" ? "/admin" : "/intern");
      }
    } else {
      toast({
        title: "Login failed",
        description: result.error || "Invalid credentials",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2D0B59] via-[#5B1AA6] to-[#7C3AED] text-white p-16 flex-col justify-center">
        <img src="/cirrus-logo.png" className="w-36 mb-10" />
        <h1 className="text-5xl font-bold">
          Interns<span className="text-pink-400">360</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/90">
          Manage interns, attendance, standups, and performance in one platform.
        </p>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
              className={`w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-purple-500`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: undefined });
                }}
                className={`w-full mt-1 px-3 py-2 border rounded-md pr-10 focus:ring-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:ring-purple-500`}
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Azure SSO */}
          <button
            type="button"
            onClick={() => (window.location.href = getAzureLoginUrl())}
            className="w-full h-11 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              className="w-4 h-4"
            />
            Sign in with Microsoft
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
