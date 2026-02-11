import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getAzureLoginUrl } from "@/config/azure";
import { useSearchParams } from "react-router-dom";
import apiClient from "@/services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const injectStyles = () => {
  const styleId = "login-animations";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(-3deg); }
      50% { transform: translateY(-8px) rotate(2deg); }
    }
    @keyframes floatFast {
      0%, 100% { transform: translateY(0px) rotate(2deg); }
      50% { transform: translateY(-10px) rotate(-2deg); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
    .input-shake {
      animation: shake 0.4s ease-in-out;
    }

    @keyframes sad {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(3px) rotate(-2deg); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
};

interface CharacterProps {
  showPassword: boolean;
  hasError: boolean;
  isTyping: boolean;
  mouseX: number;
  mouseY: number;
}

const AnimatedCharacters: React.FC<CharacterProps> = ({ showPassword, hasError, isTyping, mouseX, mouseY }) => {
  const getEyeOffset = (charWidth: number) => {
    const offset = (mouseX - 50) / 50;
    return Math.max(-charWidth * 0.15, Math.min(charWidth * 0.15, offset));
  };

  // Calculate head tilt and movement based on mouse position
  const headRotation = ((mouseX - 50) / 50) * 15;
  const headTilt = ((mouseY - 50) / 50) * 10;
  const headOffsetX = ((mouseX - 50) / 50) * 8;
  const headOffsetY = ((mouseY - 50) / 50) * 6;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "40px",
        height: "200px",
        position: "relative",
      }}
    >
      {/* Character 1 - Purple tall blob */}
      <div
        style={{
          width: "70px",
          height: "130px",
          background: "linear-gradient(180deg, #505081 0%, #272757 100%)",
          borderRadius: "35px 35px 30px 30px",
          position: "relative",
          animation: hasError ? "shake 0.4s ease-in-out, sad 1.5s ease-in-out infinite" : "floatSlow 4s ease-in-out infinite",
          boxShadow: "0 12px 30px rgba(124, 58, 237, 0.3)",
          willChange: "transform",
          transform: `translate(${headOffsetX * 0.6}px, ${headOffsetY * 0.6}px) rotate(${headRotation * 0.5}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            top: "38px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "14px",
              height: showPassword ? "14px" : "4px",
              background: "#1e1145",
              borderRadius: showPassword ? "50%" : "2px",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showPassword && (
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "3px",
                  left: `${5 + getEyeOffset(70) * 0.3}px`,
                  transition: "left 0.05s ease-out",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "14px",
              height: showPassword ? "14px" : "4px",
              background: "#1e1145",
              borderRadius: showPassword ? "50%" : "2px",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showPassword && (
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "3px",
                  left: `${5 + getEyeOffset(70) * 0.3}px`,
                  transition: "left 0.05s ease-out",
                }}
              />
            )}
          </div>
        </div>
        {/* Mouth */}
        <div
          style={{
            position: "absolute",
            top: "65px",
            left: "50%",
            transform: "translateX(-50%)",
            width: hasError ? "12px" : "8px",
            height: hasError ? "12px" : "8px",
            background: "#1e1145",
            borderRadius: hasError ? "50% 50% 0 0" : "50%",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Character 2 - Orange main blob */}
      <div
        style={{
          width: "100px",
          height: "120px",
          background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)",
          borderRadius: "50px 50px 45px 45px",
          position: "relative",
          animation: hasError ? "shake 0.4s ease-in-out" : isTyping ? "bounce 0.5s ease-in-out infinite" : "float 3s ease-in-out infinite",
          boxShadow: "0 12px 30px rgba(249, 115, 22, 0.3)",
          zIndex: 2,
          willChange: "transform",
          transform: `translate(${headOffsetX}px, ${headOffsetY}px) rotate(${headRotation}deg) skewY(${headTilt * 0.3}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "18px",
              height: showPassword ? "18px" : "5px",
              background: "#1e1145",
              borderRadius: showPassword ? "50%" : "3px",
              transition: "all 0.3s ease",
              animation: showPassword ? "blink 4s infinite" : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showPassword && (
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "4px",
                  left: `${6 + getEyeOffset(100) * 0.4}px`,
                  transition: "left 0.05s ease-out",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "18px",
              height: showPassword ? "18px" : "5px",
              background: "#1e1145",
              borderRadius: showPassword ? "50%" : "3px",
              transition: "all 0.3s ease",
              animation: showPassword ? "blink 4s infinite" : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showPassword && (
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "4px",
                  left: `${6 + getEyeOffset(100) * 0.4}px`,
                  transition: "left 0.05s ease-out",
                }}
              />
            )}
          </div>
        </div>
        {/* Mouth */}
        <div
          style={{
            position: "absolute",
            top: "65px",
            left: "50%",
            transform: "translateX(-50%)",
            width: hasError ? "20px" : "14px",
            height: hasError ? "10px" : "14px",
            background: "#1e1145",
            borderRadius: hasError ? "0 0 20px 20px" : "50%",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Character 3 - Yellow small blob */}
      <div
        style={{
          width: "60px",
          height: "80px",
          background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
          borderRadius: "30px 30px 27px 27px",
          position: "relative",
          animation: hasError ? "shake 0.4s ease-in-out, sad 1.2s ease-in-out infinite" : "floatFast 2.5s ease-in-out infinite 0.5s",
          boxShadow: "0 12px 30px rgba(251, 191, 36, 0.3)",
          willChange: "transform",
          transform: `translate(${headOffsetX * 0.8}px, ${headOffsetY * 0.8}px) rotate(${headRotation * 0.7}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            top: "23px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: showPassword ? "12px" : "3px",
              background: "#1e1145",
              borderRadius: showPassword ? "50%" : "2px",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showPassword && (
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "2px",
                  left: `${4 + getEyeOffset(60) * 0.25}px`,
                  transition: "left 0.05s ease-out",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "12px",
              height: showPassword ? "12px" : "3px",
              background: "#1e1145",
              borderRadius: showPassword ? "50%" : "2px",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showPassword && (
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "2px",
                  left: `${4 + getEyeOffset(60) * 0.25}px`,
                  transition: "left 0.05s ease-out",
                }}
              />
            )}
          </div>
        </div>
        {/* Mouth */}
        <div
          style={{
            position: "absolute",
            top: "45px",
            left: "50%",
            transform: "translateX(-50%)",
            width: hasError ? "9px" : "7px",
            height: hasError ? "7px" : "7px",
            background: "#1e1145",
            borderRadius: hasError ? "0 0 12px 12px" : "50%",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Sparkles */}
      <div
        style={{
          position: "absolute",
          top: "5px",
          right: "15px",
          fontSize: "22px",
          animation: "float 2s ease-in-out infinite",
        }}
      >
        ✦
      </div>
      <div
        style={{
          position: "absolute",
          top: "35px",
          left: "10px",
          fontSize: "16px",
          animation: "float 3s ease-in-out infinite 0.5s",
        }}
      >
        ✦
      </div>
    </div>
  );
};

const forgetpassword: React.FC = () => {
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{newPassword?: string;confirmPassword?: string;}>({});
  const [hasLoginError, setHasLoginError] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout>();
  const [params] = useSearchParams();
  // const resetId = params.get("resetId");
  const email = params.get("email");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    injectStyles();
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMouseX(x);
      setMouseY(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setErrors({ ...errors, [field]: undefined });
    setHasLoginError(false);
    setIsTyping(true);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 500);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("Invalid email format");
      return;
    }

    setForgotError(null);
    setForgotLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });

      toast({
        title: "Reset email sent",
        description: `A reset link was sent from interns360@cirruslabs.io to ${forgotEmail}.`,
      });

      setForgotOpen(false);
      setForgotEmail("");
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to send reset email";
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

      //Password
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

      const validatePasswordForm = () => {
        const e: {
          newPassword?: string;
          confirmPassword?: string;
        } = {};

        if (!newPassword) {
          e.newPassword = "New password is required";
        } else if (!passwordRegex.test(newPassword)) {
          e.newPassword =
            "Minimum 8 characters with letter, number & special character";
        }

        if (!confirmPassword) {
          e.confirmPassword = "Confirm password is required";
        } else if (newPassword !== confirmPassword) {
          e.confirmPassword = "Passwords do not match";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
      };

    
      //Reset Password
      const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validatePasswordForm()) return;

      try {
        setLoading(true);

        await apiClient.post("/auth/reset-password", {
        email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });


        setSuccess(true);
      } catch (err: any) {
        setErrors({
          newPassword:
            err.response?.data?.message || "Invalid or expired reset link",
        });
      } finally {
        setLoading(false);
      }
    };



useEffect(() => {
  if (!success) return;

  const timer = setInterval(() => {
    setCountdown((c) => {
      if (c === 1) {
        navigate("/login");
      }
      return c - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [success]);


  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* LEFT PANEL - Only on desktop */}
      {!isMobile && (
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #1e1145 0%, #2d1b69 50%, #1e1145 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 8s ease infinite",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: "40px",
          }}
        >
          {/* Floating circles background */}
          <div
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(168, 85, 247, 0.2)",
              top: "-50px",
              left: "-50px",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(168, 85, 247, 0.15)",
              bottom: "100px",
              right: "-30px",
              animation: "floatSlow 8s ease-in-out infinite",
            }}
          />

          <AnimatedCharacters
            showPassword={showPassword}
            hasError={hasLoginError}
            isTyping={isTyping}
            mouseX={mouseX}
            mouseY={mouseY}
          />
          <Link to="/" style={{ textDecoration: "none" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "12px",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            Interns<span style={{ color: "#8686AC" }}>360</span>
          </h1>
          </Link>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "40px",
              textAlign: "center",
              maxWidth: "280px",
              lineHeight: 1.6,
              zIndex: 10,
            }}
          >
            Manage interns, attendance, standups, and performance in one platform.
          </p>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          padding: "40px",
          animation: mounted ? "fadeIn 0.6s ease-out forwards" : "none",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#1e1145",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            Forget Password!
          </h2>
          

          <form onSubmit={handleResetPassword}>
  {email && (
    <>
      {/* ================= NEW PASSWORD ================= */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#1e1145",
            marginBottom: "6px",
          }}
        >
          New Password
        </label>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErrors((prev) => ({ ...prev, newPassword: undefined }));
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "15px",
            border: `2px solid ${
              errors.newPassword ? "#ef4444" : "#e2e8f0"
            }`,
            borderRadius: "10px",
            outline: "none",
            transition: "all 0.2s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0F0E47";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(15,14,71,0.12)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.newPassword
              ? "#ef4444"
              : "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {errors.newPassword && (
          <p
            style={{
              fontSize: "12px",
              color: "#ef4444",
              marginTop: "4px",
            }}
          >
            {errors.newPassword}
          </p>
        )}
      </div>

      {/* ================= CONFIRM PASSWORD ================= */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#1e1145",
            marginBottom: "6px",
          }}
        >
          Confirm Password
        </label>

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }));
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              paddingRight: "48px",
              fontSize: "15px",
              border: `2px solid ${
                errors.confirmPassword ? "#ef4444" : "#e2e8f0"
              }`,
              borderRadius: "10px",
              outline: "none",
              transition: "all 0.2s ease",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0F0E47";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(15,14,71,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.confirmPassword
                ? "#ef4444"
                : "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p
            style={{
              fontSize: "12px",
              color: "#ef4444",
              marginTop: "4px",
            }}
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>
    </>
  )}

  {/* ================= SUBMIT BUTTON ================= */}
  <button
    type="submit"
    disabled={loading}
    style={{
      width: "100%",
      padding: "14px",
      fontSize: "15px",
      fontWeight: 600,
      color: "#fff",
      background: loading
        ? "#94a3b8"
        : "linear-gradient(135deg, #1e1145, #2d1b69)",
      border: "none",
      borderRadius: "10px",
      cursor: loading ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: loading
        ? "none"
        : "0 4px 20px rgba(30,17,69,0.3)",
      transition: "all 0.3s ease",
    }}
  >
    {loading && (
      <Loader2
        size={20}
        style={{ animation: "spin 1s linear infinite" }}
      />
    )}
    {loading ? "Updating password..." : "Submit"}
  </button>
</form>

           
        {success && (
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Password reset successful </DialogTitle>
              <DialogDescription>
                Redirecting to login in {countdown} seconds
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <button onClick={() => navigate("/login")}>
                Go to Login now
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          </div>

          {/* Azure SSO Button */}
          <button
            type="button"
            onClick={() => (window.location.href = getAzureLoginUrl())}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#1e1145",
              background: "#fff",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#0F0E47";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 21 21">
              <path d="M10 0H0V10H10V0Z" fill="#F25022" />
              <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
              <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
              <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
            </svg>
            Log in with Microsoft
          </button>

          {/* Login page */}
          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
            Remember Your Password?{" "}
            <Link to="/LoginPage" style={{ color: "#0F0E47", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email to receive a reset link from interns360@cirruslabs.io.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit}>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotError(null);
                }}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F0E47]"
              />
              {forgotError && (
                <p className="text-xs text-red-500">{forgotError}</p>
              )}
            </div>
            <DialogFooter className="mt-6">
              <button
                type="submit"
                disabled={forgotLoading}
                className="inline-flex items-center justify-center rounded-lg bg-[#1e1145] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {forgotLoading ? "Sending..." : "Send password reset"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default forgetpassword;