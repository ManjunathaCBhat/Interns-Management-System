import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAzureLoginUrl } from "@/config/azure";

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
    @keyframes blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 0.6;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-15deg); }
      75% { transform: rotate(15deg); }
    }
    @keyframes bounce-hi {
      0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
      50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
    }
    @keyframes excited {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.05) rotate(-5deg); }
      50% { transform: scale(1.08); }
      75% { transform: scale(1.05) rotate(5deg); }
    }
  `;
  document.head.appendChild(style);
};

interface CharacterProps {
  mouseX: number;
  mouseY: number;
  position: "left" | "right";
}

const Character: React.FC<CharacterProps> = ({ mouseX, mouseY, position }) => {
  const [hoveredChar, setHoveredChar] = React.useState<number | null>(null);
  const getEyeOffset = (charWidth: number) => {
    const offset = (mouseX - 50) / 50;
    return Math.max(-charWidth * 0.15, Math.min(charWidth * 0.15, offset));
  };

  const headRotation = ((mouseX - 50) / 50) * 15;
  const headOffsetX = ((mouseX - 50) / 50) * 8;
  const headOffsetY = ((mouseY - 50) / 50) * 6;

  // Left side: Purple and Yellow characters
  // Right side: Orange character
  const isLeft = position === "left";
  const bendRotation = isLeft ? -30 : 30;

  if (isLeft) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "40px",
          alignItems: "center",
        }}
      >
        {/* Purple Character */}
        <div
          onMouseEnter={() => setHoveredChar(1)}
          onMouseLeave={() => setHoveredChar(null)}
          style={{
            width: "70px",
            height: "130px",
            background: "linear-gradient(180deg, #505081 0%, #272757 100%)",
            borderRadius: "35px 35px 30px 30px",
            position: "relative",
            animation: hoveredChar === 1 ? "excited 0.6s ease-in-out infinite" : "floatSlow 4s ease-in-out infinite",
            boxShadow: hoveredChar === 1 ? "0 16px 40px rgba(124, 58, 237, 0.6)" : "0 12px 30px rgba(124, 58, 237, 0.3)",
            transform: `translate(${headOffsetX * 0.6}px, ${headOffsetY * 0.6}px) rotate(${bendRotation + headRotation * 0.5}deg)`,
            transition: "transform 0.3s ease-out, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "absolute", top: "38px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "12px" }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: "14px", height: "14px", background: "#1e1145", borderRadius: "50%", position: "relative", overflow: "hidden" }}>
                <div style={{ width: "6px", height: "6px", background: "white", borderRadius: "50%", position: "absolute", top: "3px", left: `${5 + getEyeOffset(70) * 0.3}px`, transition: "left 0.05s" }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: "65px", left: "50%", transform: "translateX(-50%)", width: hoveredChar === 1 ? "20px" : "8px", height: hoveredChar === 1 ? "10px" : "8px", background: "#1e1145", borderRadius: hoveredChar === 1 ? "0 0 20px 20px" : "50%", transition: "all 0.3s ease" }} />
          <div style={{ position: "absolute", top: "5px", left: "-20px", fontSize: "22px", animation: "float 2s ease-in-out infinite" }}>✦</div>
          {hoveredChar === 1 && (
            <div
              style={{
                position: "absolute",
                top: "-35px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(30, 17, 69, 0.95)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                animation: "bounce-hi 0.6s ease-in-out infinite",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                whiteSpace: "nowrap",
              }}
            >
              Hi! 👋
            </div>
          )}
        </div>

        {/* Orange Character */}
        <div
          onMouseEnter={() => setHoveredChar(2)}
          onMouseLeave={() => setHoveredChar(null)}
          style={{
            width: "100px",
            height: "120px",
            background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)",
            borderRadius: "50px 50px 45px 45px",
            position: "relative",
            animation: hoveredChar === 2 ? "excited 0.6s ease-in-out infinite" : "float 3s ease-in-out infinite",
            boxShadow: hoveredChar === 2 ? "0 16px 40px rgba(249, 115, 22, 0.6)" : "0 12px 30px rgba(249, 115, 22, 0.3)",
            transform: `translate(${headOffsetX}px, ${headOffsetY}px) rotate(${bendRotation + headRotation}deg)`,
            transition: "transform 0.3s ease-out, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "absolute", top: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "20px" }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: "18px", height: "18px", background: "#1e1145", borderRadius: "50%", animation: "blink 4s infinite", position: "relative", overflow: "hidden" }}>
                <div style={{ width: "7px", height: "7px", background: "white", borderRadius: "50%", position: "absolute", top: "4px", left: `${6 + getEyeOffset(100) * 0.4}px`, transition: "left 0.05s" }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: "65px", left: "50%", transform: "translateX(-50%)", width: hoveredChar === 2 ? "24px" : "14px", height: hoveredChar === 2 ? "12px" : "14px", background: "#1e1145", borderRadius: hoveredChar === 2 ? "0 0 24px 24px" : "50%", transition: "all 0.3s ease" }} />
          {hoveredChar === 2 && (
            <div
              style={{
                position: "absolute",
                top: "-40px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(30, 17, 69, 0.95)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                animation: "bounce-hi 0.6s ease-in-out infinite",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                whiteSpace: "nowrap",
              }}
            >
              Hello! 🎉
            </div>
          )}
        </div>
      </div>
    );
  }

  // Right side - Yellow and Another Character
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        alignItems: "center",
      }}
    >
      {/* Yellow Character */}
      <div
        onMouseEnter={() => setHoveredChar(3)}
        onMouseLeave={() => setHoveredChar(null)}
        style={{
          width: "60px",
          height: "80px",
          background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
          borderRadius: "30px 30px 27px 27px",
          position: "relative",
          animation: hoveredChar === 3 ? "excited 0.6s ease-in-out infinite" : "floatFast 2.5s ease-in-out infinite 0.5s",
          boxShadow: hoveredChar === 3 ? "0 16px 40px rgba(251, 191, 36, 0.6)" : "0 12px 30px rgba(251, 191, 36, 0.3)",
          transform: `translate(${headOffsetX * 0.8}px, ${headOffsetY * 0.8}px) rotate(${bendRotation + headRotation * 0.7}deg)`,
          transition: "transform 0.3s ease-out, box-shadow 0.3s ease",
          cursor: "pointer",
        }}
      >
        <div style={{ position: "absolute", top: "23px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ width: "12px", height: "12px", background: "#1e1145", borderRadius: "50%", position: "relative", overflow: "hidden" }}>
              <div style={{ width: "5px", height: "5px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", left: `${4 + getEyeOffset(60) * 0.25}px`, transition: "left 0.05s" }} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: "45px", left: "50%", transform: "translateX(-50%)", width: hoveredChar === 3 ? "16px" : "7px", height: hoveredChar === 3 ? "8px" : "7px", background: "#1e1145", borderRadius: hoveredChar === 3 ? "0 0 16px 16px" : "50%", transition: "all 0.3s ease" }} />
        <div style={{ position: "absolute", top: "5px", right: "-20px", fontSize: "22px", animation: "float 2s ease-in-out infinite 0.5s" }}>✦</div>
        {hoveredChar === 3 && (
          <div
            style={{
              position: "absolute",
              top: "-35px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(30, 17, 69, 0.95)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              animation: "bounce-hi 0.6s ease-in-out infinite",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            Hey! ✨
          </div>
        )}
      </div>

      {/* Green Character */}
      <div
        onMouseEnter={() => setHoveredChar(4)}
        onMouseLeave={() => setHoveredChar(null)}
        style={{
          width: "75px",
          height: "110px",
          background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
          borderRadius: "37px 37px 33px 33px",
          position: "relative",
          animation: hoveredChar === 4 ? "excited 0.6s ease-in-out infinite" : "floatSlow 3.5s ease-in-out infinite 0.3s",
          boxShadow: hoveredChar === 4 ? "0 16px 40px rgba(16, 185, 129, 0.6)" : "0 12px 30px rgba(16, 185, 129, 0.3)",
          transform: `translate(${headOffsetX * 0.7}px, ${headOffsetY * 0.7}px) rotate(${bendRotation + headRotation * 0.6}deg)`,
          transition: "transform 0.3s ease-out, box-shadow 0.3s ease",
          cursor: "pointer",
        }}
      >
        <div style={{ position: "absolute", top: "35px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "15px" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ width: "16px", height: "16px", background: "#1e1145", borderRadius: "50%", position: "relative", overflow: "hidden" }}>
              <div style={{ width: "6px", height: "6px", background: "white", borderRadius: "50%", position: "absolute", top: "4px", left: `${5 + getEyeOffset(75) * 0.35}px`, transition: "left 0.05s" }} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: hoveredChar === 4 ? "22px" : "10px", height: hoveredChar === 4 ? "11px" : "10px", background: "#1e1145", borderRadius: hoveredChar === 4 ? "0 0 22px 22px" : "50%", transition: "all 0.3s ease" }} />
        {hoveredChar === 4 && (
          <div
            style={{
              position: "absolute",
              top: "-38px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(30, 17, 69, 0.95)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              animation: "bounce-hi 0.6s ease-in-out infinite",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            Hi there! 💚
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const navigate = useNavigate();

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

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples([...ripples, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    setLoading(true);
    setTimeout(() => {
      window.location.href = getAzureLoginUrl();
    }, 400);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #1e1145 0%, #2d1b69 50%, #1e1145 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 8s ease infinite",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating circles background */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(168, 85, 247, 0.12)", top: "-100px", left: "-100px", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(168, 85, 247, 0.08)", bottom: "-50px", right: "-50px", animation: "floatSlow 8s ease-in-out infinite" }} />

      {/* Container with Characters and Login Form */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          margin: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1200px",
          padding: "40px 20px",
          gap: "60px",
        }}
      >
        {/* Left Characters */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
          <Character mouseX={mouseX} mouseY={mouseY} position="left" />
        </div>

        {/* Login Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "56px 48px 32px 48px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            animation: mounted ? "fadeIn 0.6s ease-out forwards" : "none",
          }}
        >
          {/* Interns360 Logo */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <img src="/interns360_logo.png" alt="Interns360" style={{ height: "28px", width: "auto", display: "block", margin: "0 auto 24px auto" }} />
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1e1145", margin: 0, letterSpacing: "-0.5px" }}>Login</h1>
          </div>

          {/* Azure SSO Button */}
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#fff",
              background: loading ? "linear-gradient(135deg, #3d2b7a 0%, #2d1b69 100%)" : "linear-gradient(135deg, #1e1145 0%, #2d1b69 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: "0 8px 24px rgba(30, 17, 69, 0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              marginBottom: "32px",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(30, 17, 69, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(30, 17, 69, 0.4)";
              }
            }}
            onMouseDown={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(0) scale(0.98)";
            }}
            onMouseUp={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
            }}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: ripple.x,
                  top: ripple.y,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.6)",
                  animation: "ripple 0.6s ease-out",
                  pointerEvents: "none",
                }}
              />
            ))}
            {loading ? (
              <>
                <div style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Signing in...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 21 21">
                  <path d="M10 0H0V10H10V0Z" fill="#F25022" />
                  <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
                  <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
                  <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </button>

          {/* Powered by CirrusLabs with i360 logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
            <img src="/i360_logo.png" alt="i360" style={{ height: "19px", width: "auto", marginRight: "-2px" }} />
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>Powered by</span>
            <img src="/cl_logo.png" alt="CirrusLabs" style={{ height: "15px", width: "auto" }} />
          </div>
        </div>

        {/* Right Character */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
          <Character mouseX={mouseX} mouseY={mouseY} position="right" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
