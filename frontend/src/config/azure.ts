/**
 * Azure AD SSO Configuration
 * Update these values with your Azure App Registration details
 */

export const AZURE_CONFIG = {
  // These values from your .env or Azure Portal
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "dd2ad1eb-6c5e-46c9-82bf-edda71230acf",
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || "858d9da-8dfa-4b12-9f90-d0448a34f6d1",
  
  // Redirect URI after Azure login - must match your App Registration
  redirectUri: `${window.location.origin}/auth/azure-callback`,
  
  // Scopes needed
  scopes: ["User.Read"],
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
    scope: "User.Read",
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
