import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [counters, setCounters] = useState({ interns: 0, projects: 0, completion: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsVisible]);

  // Animate counters when visible
  useEffect(() => {
    if (statsVisible) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setCounters({
          interns: Math.floor(50 * easeOut),
          projects: Math.floor(10 * easeOut),
          completion: Math.floor(98 * easeOut),
        });
        
        if (step >= steps) clearInterval(timer);
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [statsVisible]);

  const features = [
    { icon: Users, title: 'Intern Management', description: 'Track all interns from onboarding to completion with detailed profiles and progress monitoring.', gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' },
    { icon: ClipboardCheck, title: 'Daily Standups', description: 'Streamlined DSU forms for interns with real-time mentor visibility and feedback loops.', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
    { icon: TrendingUp, title: 'Growth Tracking', description: 'Monitor intern progress with interactive timelines, milestones, and performance metrics.', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Real-time insights on intern distribution, project allocation, and team performance.', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' },
    { icon: Shield, title: 'Role-Based Access', description: 'Secure dashboards for admins and interns with granular permission controls.', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    { icon: Zap, title: 'Quick Actions', description: 'One-click actions for common tasks like status updates, approvals, and notifications.', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' },
  ];

  const stats = [
    { value: counters.interns, suffix: '+', label: 'Interns Managed', icon: Users },
    { value: counters.projects, suffix: '+', label: 'Active Projects', icon: BarChart3 },
    { value: counters.completion, suffix: '%', label: 'DSU Completion', icon: TrendingUp },
  ];

  // Generate floating particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  // Inject keyframes
  useEffect(() => {
    const styleId = 'homepage-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px) rotate(90deg); opacity: 0.8; }
          50% { transform: translateY(-40px) translateX(-10px) rotate(180deg); opacity: 0.5; }
          75% { transform: translateY(-20px) translateX(20px) rotate(270deg); opacity: 0.7; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.2); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slide-up {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
          75% { border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%; }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
          50% { text-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4); }
        }
        @keyframes border-dance {
          0%, 100% { border-color: rgba(168, 85, 247, 0.3); }
          50% { border-color: rgba(168, 85, 247, 0.8); }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0a1e 0%, #1e1145 25%, #2d1b69 50%, #1e1145 75%, #0f0a1e 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient-shift 15s ease infinite',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      
      {/* Animated Background Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: 'rgba(168, 85, 247, 0.6)',
              borderRadius: '50%',
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Morphing Blob Background */}
      <div style={{
        position: 'fixed',
        top: '10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        animation: 'morph 20s ease-in-out infinite',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        animation: 'morph 25s ease-in-out infinite reverse',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Dynamic Cursor Glow */}
      <div style={{
        position: 'fixed',
        left: mousePos.x - 200,
        top: mousePos.y - 200,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'left 0.01s, top 0.01s',
        filter: 'blur(40px)',
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1rem 2rem',
        background: scrollY > 50 ? 'rgba(15, 10, 30, 0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(168, 85, 247, 0.2)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: 45,
              height: 45,
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Interns360
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" style={{
              padding: '0.6rem 1.5rem',
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              borderRadius: '10px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.background = 'transparent';
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '6rem 2rem 4rem',
      }}>
        <div style={{
          maxWidth: '1000px',
          textAlign: 'center',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s ease-out',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '50px',
            marginBottom: '2rem',
            animation: 'border-dance 3s ease-in-out infinite',
          }}>
            <Sparkles size={14} color="#a855f7" />
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
              Next-Gen Intern Management Platform
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 25%, #a855f7 50%, #6366f1 75%, #ffffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 4s linear infinite',
          }}>
            Interns360
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.7,
            maxWidth: '700px',
            margin: '0 auto 3rem',
            fontWeight: 400,
          }}>
            Manage your entire intern lifecycle with confidence. Track progress, daily standups, 
            attendance, and performance — all in one powerful platform.
          </p>

          {/* CTA Button */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '4rem',
          }}>
            <Link to="/login" style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '14px',
              boxShadow: '0 8px 40px rgba(168, 85, 247, 0.5)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 50px rgba(168, 85, 247, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(168, 85, 247, 0.5)';
            }}>
              Get Started <ArrowRight size={20} />
            </Link>
          </div>

          {/* Hero Visual - 3D Card */}
          <div style={{
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto',
            perspective: '1000px',
          }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 17, 69, 0.8) 0%, rgba(15, 10, 30, 0.9) 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '2rem',
              boxShadow: '0 25px 100px rgba(168, 85, 247, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.1) inset',
              transform: `rotateX(${(mousePos.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePos.x - window.innerWidth / 2) * 0.01}deg)`,
              transition: 'transform 0.1s ease-out',
            }}>
              {/* Mock Dashboard Preview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                  }}>
                    <div style={{
                      width: '100%',
                      height: '80px',
                      background: `linear-gradient(135deg, rgba(168, 85, 247, ${0.2 + i * 0.1}) 0%, rgba(99, 102, 241, ${0.2 + i * 0.1}) 100%)`,
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }} />
                    <div style={{
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                    }} />
                    <div style={{
                      height: '12px',
                      width: '60%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Powerful Features
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Everything you need to manage, track, and grow your intern program effectively.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                  style={{
                    background: isActive 
                      ? 'linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(30, 17, 69, 0.9) 100%)'
                      : 'linear-gradient(145deg, rgba(30, 17, 69, 0.6) 0%, rgba(15, 10, 30, 0.8) 100%)',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: `1px solid ${isActive ? 'rgba(168, 85, 247, 0.5)' : 'rgba(168, 85, 247, 0.15)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isActive ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: isActive 
                      ? '0 20px 60px rgba(168, 85, 247, 0.3)'
                      : '0 10px 40px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Glow effect on hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: feature.gradient,
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                  }} />

                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: feature.gradient,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: isActive ? `0 10px 30px ${feature.gradient.match(/rgba?\([^)]+\)|#[a-fA-F0-9]+/)?.[0] || 'rgba(168, 85, 247, 0.3)'}40` : 'none',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                  }}>
                    <Icon size={28} color="#fff" />
                  </div>

                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '0.75rem',
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: 1.6,
                  }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '6rem 2rem',
        }}
      >
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(30, 17, 69, 0.6) 100%)',
          borderRadius: '30px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          padding: '4rem 2rem',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s ease-out ${index * 0.2}s`,
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}>
                    <Icon size={32} color="#a855f7" />
                  </div>
                  <div style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: statsVisible ? 'text-glow 3s ease-in-out infinite' : 'none',
                  }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500,
                    marginTop: '0.5rem',
                  }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '6rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '1.5rem',
            color: '#fff',
          }}>
            Ready to Transform Your
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Intern Program?
            </span>
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '2.5rem',
          }}>
            {/* Join hundreds of companies already using Interns360 to manage their talent pipeline. */}
          </p>
          <Link to="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.2rem 3rem',
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.2rem',
            fontWeight: 700,
            borderRadius: '16px',
            boxShadow: '0 10px 50px rgba(168, 85, 247, 0.5)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 60px rgba(168, 85, 247, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 50px rgba(168, 85, 247, 0.5)';
          }}>
            Start Free <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '3rem 2rem',
        borderTop: '1px solid rgba(168, 85, 247, 0.1)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            © 2026 Interns360. Powered by Cirrus Labs.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;