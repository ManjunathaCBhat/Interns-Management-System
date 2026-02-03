/**
 * Color Coding System for Intern Lifecycle Manager
 * Follows the purple + pink + white scheme
 */

export const COLORS = {
  // Primary (Purple – Buttons & Accents)
  primary: {
    purple: '#7C3AED',        // Primary Purple
    deepPurple: '#9333EA',    // Deep Purple
    darkViolet: '#5B1AA6',    // Dark Violet
    midViolet: '#3B0F6F',     // Mid Violet
    basePurple: '#2D0B59',    // Base Purple
  },

  // Accent (Pink – Cursor Glow & Highlights)
  accent: {
    pink: '#FF4DA6',          // Accent Pink
    glowStrong: 'rgba(255, 77, 166, 0.35)',  // Soft Pink Glow
    glowLight: 'rgba(255, 77, 166, 0.15)',   // Light Pink Glow
  },

  // Neutral (Text & Borders)
  neutral: {
    white: '#FFFFFF',                          // Pure White
    textWhite: 'rgba(255, 255, 255, 0.85)',   // Soft White (Text)
    borderWhite: 'rgba(255, 255, 255, 0.40)', // Border White
    borderMuted: 'rgba(255, 255, 255, 0.35)', // Muted Border
  },

  // Status Colors (derived from primary/accent)
  status: {
    success: '#10B981',       // Green
    error: '#EF4444',         // Red
    warning: '#F59E0B',       // Amber
    info: '#3B82F6',          // Blue
    pending: '#F59E0B',       // Amber (same as warning)
  },
} as const;

/**
 * Get status color based on intern status
 */
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: COLORS.status.success,
    completed: COLORS.status.success,
    done: COLORS.status.success,
    approved: COLORS.status.success,
    onboarding: COLORS.status.info,
    training: COLORS.status.info,
    in_progress: COLORS.status.warning,
    pending: COLORS.status.warning,
    inactive: '#94a3b8',
    blocked: COLORS.status.error,
    rejected: COLORS.status.error,
    terminated: COLORS.status.error,
    dropped: COLORS.status.error,
  };
  return statusMap[status?.toLowerCase()] || '#94a3b8';
};

/**
 * Get background color with opacity for status badge
 */
export const getStatusBgColor = (status: string): string => {
  const color = getStatusColor(status);
  // Extract hex color and add opacity
  if (color.startsWith('#')) {
    return `${color}20`; // 20 = ~12% opacity in hex
  }
  return color;
};

/**
 * Tailwind color utility helpers
 */
export const colorClasses = {
  primaryButton: 'bg-[#7C3AED] hover:bg-[#9333EA] text-white',
  primaryButtonOutline: 'border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10',
  accentButton: 'bg-[#FF4DA6] hover:bg-[#FF4DA6]/90 text-white',
  darkBg: 'bg-[#2D0B59]',
  purpleText: 'text-[#7C3AED]',
  whiteText: 'text-white',
} as const;
