import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * Azure SSO Callback Handler
 * This component handles the redirect from Azure after successful authentication
 */
const AzureAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthUser } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;

    const handleAzureCallback = async () => {
      hasProcessed.current = true;
      try {
        // Get the authorization code from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code) {
          throw new Error('No authorization code received from Azure');
        }

        // Exchange code for token (this would be done on backend ideally)
        // For now, we'll use the MSAL library approach
        console.log('Authorization code received, exchanging for token...');

        // Get backend URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

        // Call your backend to exchange code for token and create/update user
        const response = await fetch(`${apiUrl}/auth/sso/azure/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with Azure');
        }

        const data = await response.json();
        const { access_token, user } = data;

        console.log('SSO Login successful:', { user, access_token: access_token ? 'present' : 'missing' });

        // Update auth context with user and token
        setAuthUser(user, access_token);

        toast({
          title: 'Welcome!',
          description: `Signed in as ${user.email}`,
        });

        // Navigate to dashboard based on role (admin, scrum_master, intern)
        let dashboardPath = '/intern';
        switch (user.role) {
          case 'admin':
            dashboardPath = '/admin';
            break;
          case 'scrum_master':
            dashboardPath = '/scrum-master';
            break;
          case 'intern':
          default:
            dashboardPath = '/intern';
            break;
        }

        console.log('Navigating to:', dashboardPath, 'User role:', user.role);

        // Use window.location for a full page navigation to ensure state is updated
        window.location.href = dashboardPath;
      } catch (error: any) {
        console.error('Azure SSO callback error:', error);
        toast({
          title: 'Authentication failed',
          description: error.message || 'Failed to sign in with Azure',
          variant: 'destructive',
        });
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAzureCallback();
  }, [searchParams, navigate, setAuthUser, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isProcessing ? 'Signing you in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default AzureAuthCallback;
