export const Colors = {
  light: {
    background: '#F5F5F7', // Smooth, universally pleasing tech light gray
    surface: '#FFFFFF',
    text: '#1D1D1F',       // Sleek off-black
    textSecondary: '#86868B',
    textMuted: '#D2D2D7',
    border: '#E5E5EA',
    primary: '#1D1D1F',
    accent: '#0A84FF',     // iOS system blue — primary interactive color
    accentMuted: '#EAF3FF', // Tinted accent background for icons / highlights
    inputBg: '#E8E8ED',
    skeleton: '#EAEAEA',
    error: '#FF3B30',
    favorite: '#FF9500',   // Warm vibrant star yellow/orange
    borderChipBg: '#FFFFFF',
    borderChipBorder: '#E5E5EA',
    borderChipText: '#1D1D1F',
    headerBg: '#F5F5F7',
    onAccent: '#FFFFFF',       // Text/icons placed on accent-colored surfaces
    badgeOverlay: 'rgba(0,0,0,0.52)', // Semi-transparent overlay badge on images
  },
  dark: {
    background: '#000000', // Jet black for pure contrast
    surface: '#1D1D1F',    // Elevated dark gray surface
    text: '#F5F5F7',
    textSecondary: '#86868B',
    textMuted: '#424245',
    border: '#333336',
    primary: '#F5F5F7',
    accent: '#0A84FF',     // iOS system blue — consistent across modes
    accentMuted: '#0A1E35', // Deep navy tint for dark mode accent backgrounds
    inputBg: '#2C2C2E',
    skeleton: '#38383A',
    error: '#FF453A',
    favorite: '#FF9F0A',
    borderChipBg: '#1D1D1F',
    borderChipBorder: '#333336',
    borderChipText: '#F5F5F7',
    headerBg: '#000000',
    onAccent: '#FFFFFF',       // Text/icons placed on accent-colored surfaces
    badgeOverlay: 'rgba(0,0,0,0.52)', // Semi-transparent overlay badge on images
  },
} as const;

export type AppColors = { [K in keyof typeof Colors.light]: string };
