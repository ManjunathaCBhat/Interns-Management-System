import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/intern';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('intern');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await register(name, email, password, role);

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Welcome to Intern Lifecycle Manager.',
      });
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast({
        title: 'Registration failed',
        description: result.error || 'Something went wrong',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="relative hidden flex-1 lg:flex bg-[#2D0B59]">
        <div className="absolute inset-0 bg-[#FF4DA6]/15" />
        <div className="relative flex flex-col items-center justify-center p-12 text-center text-white/85">
          <div className="max-w-md">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C3AED]/30 backdrop-blur">
              <span className="text-3xl font-bold">IL</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold">
              Join the Platform
            </h1>
            <p className="text-lg text-white/80">
              Create your account to start managing interns or begin your
              internship journey with guided task tracking and daily updates.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7C3AED]">
                <span className="text-lg font-bold text-white">IL</span>
              </div>
              <span className="text-xl font-semibold">Intern Lifecycle</span>
            </Link>
            <h2 className="text-2xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start your journey with Intern Lifecycle Manager
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border border-white/35 focus:border-[#FF4DA6] focus:ring-[#FF4DA6]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border border-white/35 focus:border-[#FF4DA6] focus:ring-[#FF4DA6]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C3AED] hover:text-[#FF4DA6]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am joining as</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger className="h-11 border border-white/35 focus:border-[#FF4DA6]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="admin">Admin / Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#7C3AED] hover:bg-[#5B1AA6] text-white shadow-[0_0_20px_rgba(255,77,166,0.35)]"
              disabled={isLoading}
            >

              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#FF4DA6] hover:text-[#FF4DA6]/80">
              Sign in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-[#FF4DA6]">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;