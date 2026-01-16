import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Intern Management',
      description:
        'Track all interns from onboarding to completion with detailed profiles and progress tracking.',
    },
    {
      icon: ClipboardCheck,
      title: 'Daily Standups',
      description:
        'Streamlined DSU forms for interns with mentor visibility and status tracking.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description:
        'Monitor intern progress with timelines, feedback, and performance metrics.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description:
        'Real-time insights on intern distribution, DSU completion, and project allocation.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description:
        'Separate dashboards for admins and interns with appropriate permissions.',
    },
    {
      icon: Zap,
      title: 'Quick Actions',
      description:
        'One-click actions for common tasks like status updates and mentor assignments.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Interns Managed' },
    { value: '50+', label: 'Active Projects' },
    { value: '98%', label: 'DSU Completion' },
    { value: '4.9', label: 'Satisfaction Score' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Enterprise Intern Management
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Manage Your Intern{' '}
              <span className="relative">
                <span className="relative z-10">Lifecycle</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/30 -skew-x-3" />
              </span>{' '}
              with Confidence
            </h1>
            
            <p className="mb-8 text-lg text-white/80 md:text-xl">
              The complete platform for tracking intern progress, managing daily standups,
              and streamlining the entire internship journey from onboarding to completion.
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild variant="hero" size="xl">
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-foreground md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need to Manage Interns
            </h2>
            <p className="text-lg text-muted-foreground">
              A comprehensive suite of tools designed for both mentors and interns
              to make the internship experience seamless and productive.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Transform Your Intern Program?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join hundreds of companies using Intern Lifecycle Manager to
              streamline their internship programs.
            </p>
            
            <div className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {[
                'No credit card required',
                'Free for small teams',
                'Setup in minutes',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            
            <Button asChild variant="accent" size="xl">
              <Link to="/register">
                Start Managing Interns Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">IL</span>
              </div>
              <span className="font-semibold">Intern Lifecycle Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Intern Lifecycle Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
