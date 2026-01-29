/**
 * Azure AD SSO Configuration
 * Set these values in your .env file with VITE_ prefix
 */

export const AZURE_CONFIG = {
  // These values should come from environment variables
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || "",
  
  // Redirect URI after Azure login - must match your App Registration
  redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}/auth/azure-callback`,
  
  // Scopes needed - must match backend and Azure app registration
  scopes: ["User.Read", "openid", "profile", "email"],
};

/**
 * Check if Azure SSO is configured
 */
export const isAzureSSOConfigured = (): boolean => {
  return !!(AZURE_CONFIG.clientId && AZURE_CONFIG.tenantId);
};

/**
 * Build Azure login URL for redirect flow
 */
export const getAzureLoginUrl = (): string => {
  const params = new URLSearchParams({
    client_id: AZURE_CONFIG.clientId,
    response_type: "code",
    redirect_uri: AZURE_CONFIG.redirectUri,
    response_mode: "query",
    scope: "User.Read openid profile email",
    state: generateState(),
  });

  return `https://login.microsoftonline.com/${AZURE_CONFIG.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
};

/**
 * Generate random state for CSRF protection
 */
export const generateState = (): string => {
  return Math.random().toString(36).substring(7);
};

/**
 * Get token from URL hash (after Azure redirect)
 */
export const getTokenFromHash = (): string | null => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
};

/**
 * Get auth code from URL (authorization code flow)
 */
export const getAuthCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};
