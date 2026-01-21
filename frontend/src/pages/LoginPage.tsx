import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const stored = localStorage.getItem("ilm_user");
      if (stored) {
        const user = JSON.parse(stored);
        navigate(user.role === "admin" ? "/admin" : "/intern");
      }
    } else {
      alert(result.error || "Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2D0B59] via-[#5B1AA6] to-[#7C3AED] text-white p-16 flex-col justify-center">
        <img src="../cirrus-logo.png" className="w-36 mb-10" />
        <h1 className="text-5xl font-bold">
          Interns<span className="text-pink-400">360</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/90">
          Manage interns, attendance, standups and performance in one platform.
        </p>
      </div>

      {/* RIGHT */}
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-800 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Microsoft */}
          <button
            type="button"
            className="w-full h-11 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
            onClick={() => {
              window.location.href = "/auth/azure";
            }}
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
