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

        console.log('Authorization code received, exchanging for token...');

        // Get backend URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

        // Call backend to validate SSO and check user status
        const response = await fetch(`${apiUrl}/auth/sso/azure/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to authenticate with Azure');
        }

        const data = await response.json();
        const { status, user, access_token, message } = data;

        console.log('SSO response:', { status, user: user?.email, hasToken: !!access_token });

        // Handle different user states
        switch (status) {
          case 'new_user':
            // New user - redirect to profile completion with SSO data
            toast({
              title: 'Welcome!',
              description: 'Please complete your profile to continue.',
            });

            // Store profile picture in sessionStorage (too large for URL)
            if (user?.profilePicture) {
              sessionStorage.setItem('sso_profile_picture', user.profilePicture);
            }

            // Extract SSO data and pass as URL params (excluding large image)
            const ssoParams = new URLSearchParams({
              firstName: user?.firstName || user?.given_name || '',
              lastName: user?.lastName || user?.family_name || '',
              email: user?.email || '',
              phone: user?.phone || user?.phoneNumber || '',
              location: user?.location || user?.officeLocation || '',
              department: user?.department || '',
              position: user?.position || user?.jobTitle || '',
              azureOid: user?.azure_oid || '',
            });

            navigate(`/complete-profile?${ssoParams.toString()}`, {
              replace: true,
            });
            break;

          case 'pending_approval':
            // User exists but not approved
            toast({
              title: 'Account Pending',
              description: message || 'Your account is pending admin approval.',
              variant: 'default',
            });
            navigate('/pending-approval', { replace: true });
            break;

          case 'approved':
            // User approved - proceed to dashboard
            setAuthUser(user, access_token);

            toast({
              title: 'Welcome back!',
              description: `Signed in as ${user.email}`,
            });

            // Navigate to dashboard based on role
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
            window.location.href = dashboardPath;
            break;

          default:
            throw new Error('Unknown user status received from server');
        }
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
