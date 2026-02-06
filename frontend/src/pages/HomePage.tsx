import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

const HomePage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Update mouse position for the pink glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Users, title: 'Intern Management', description: 'Track all interns from onboarding to completion with detailed profiles.' },
    { icon: ClipboardCheck, title: 'Daily Standups', description: 'Streamlined DSU forms for interns with mentor visibility.' },
    { icon: TrendingUp, title: 'Growth Tracking', description: 'Monitor intern progress with timelines and performance metrics.' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Real-time insights on intern distribution and project allocation.' },
    { icon: Shield, title: 'Role-Based Access', description: 'Separate dashboards for admins and interns with secure permissions.' },
    { icon: Zap, title: 'Quick Actions', description: 'One-click actions for common tasks like status updates.' },
  ];

  const stats = [
    { value: '50+', label: 'Interns Managed' },
    { value: '10+', label: 'Active Projects' },
    { value: '98%', label: 'DSU Completion' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#2D0B59] text-white">
      <Navbar />

      {/* Dynamic Cursor Glow Layer - Reduced Range */}
<div 
  className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
  style={{
    background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 77, 166, 0.12), transparent 50%)`
  }}
/>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-32 text-center md:py-48" 
               style={{ background: 'radial-gradient(circle at center, #3B0F6F 0%, #2D0B59 100%)' }}>
        
        {/* Hero Content */}
          
        <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl">
          Interns<span className="text-[#FF4DA6]">360</span>
        </h1>
        
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/85 md:text-xl leading-relaxed">
          Manage your entire intern lifecycle with confidence. Track progress, daily standups, 
          attendance, and performance — all in one platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button 
            asChild 
            className="h-14 px-8 text-lg font-semibold bg-[#FF4DA6] hover:bg-[#FF4DA6]/90 text-white rounded-xl shadow-[0_0_20px_rgba(255,77,166,0.35)] transition-all transform hover:scale-105"
          >
            <Link to="/login" className="flex items-center">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline"
            className="h-14 px-8 text-lg font-semibold border-white/40 bg-transparent hover:bg-white/10 text-white rounded-xl"
          >
          
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 bg-[#3B0F6F]/30 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative rounded-2xl border border-white/10 bg-[#2D0B59]/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#FF4DA6]/50 hover:shadow-[0_0_30px_rgba(255,77,166,0.1)]"
              >
                {/* Individual Card Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF4DA6]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#7C3AED]/20 text-[#FF4DA6] transition-colors group-hover:bg-[#FF4DA6] group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-[#FF4DA6]">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-white/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black text-[#FF4DA6]">{stat.value}</div>
                <div className="mt-1 text-sm font-medium uppercase tracking-widest text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-white/50 border-t border-white/5">
        <div className="mb-4 text-xl font-bold text-white">
          Interns<span className="text-[#FF4DA6]">360</span>
        </div>
        <p>© 2026 Interns360. Powered by Cirrus Labs.</p>
      </footer>
    </div>
  );
};

export default HomePage;