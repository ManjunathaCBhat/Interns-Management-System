/**
 * Color Coding System for Intern Lifecycle Manager
 * Follows the Blue Eclipse palette
 */

export const COLORS = {
  // Primary (Blue Eclipse – Buttons & Accents)
  primary: {
    purple: '#505081',        // Mid Blue
    deepPurple: '#272757',    // Deep Blue
    darkViolet: '#0F0E47',    // Dark Blue
    midViolet: '#505081',     // Mid Blue
    basePurple: '#0F0E47',    // Base Dark Blue
  },

  // Accent (Muted Lavender – Highlights)
  accent: {
    pink: '#8686AC',          // Accent Lavender
    glowStrong: 'rgba(134, 134, 172, 0.35)',  // Soft Glow
    glowLight: 'rgba(134, 134, 172, 0.15)',   // Light Glow
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
  primaryButton: 'bg-[#0F0E47] hover:bg-[#272757] text-white',
  primaryButtonOutline: 'border border-[#0F0E47] text-[#0F0E47] hover:bg-[#0F0E47]/10',
  accentButton: 'bg-[#8686AC] hover:bg-[#8686AC]/90 text-white',
  darkBg: 'bg-[#0F0E47]',
  purpleText: 'text-[#505081]',
  whiteText: 'text-white',
} as const;
