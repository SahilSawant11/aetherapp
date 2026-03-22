import { Platform } from 'react-native';

type GlassVariant = 'header' | 'tabbar' | 'activeChip' | 'pill';

export type GlassPalette = {
  blurType: 'light' | 'ultraThinMaterialLight' | 'dark' | 'ultraThinMaterialDark';
  blurAmount: number;
  fallback: string;
  overlay: string;
  border: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  reflection: string[];
  innerShadow: string[];
  topEdge: string[];
  saturation: number; // New: enhances color vibrancy behind glass
  brightness: number; // New: subtle luminosity boost
};

export function getGlassPalette(variant: GlassVariant): GlassPalette {
  const isIos = Platform.OS === 'ios';
  
  const base: GlassPalette = {
    blurType: isIos ? 'ultraThinMaterialLight' : 'light',
    blurAmount: isIos ? 24 : 14,
    fallback: 'rgba(255, 255, 255, 0.02)',
    // Multi-layer approach: combine subtle tint with transparency
    overlay: isIos 
      ? 'rgba(255, 255, 255, 0.18)' 
      : 'rgba(255, 255, 255, 0.22)',
    // Softer, more diffused border
    border: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    // Realistic gradient reflection on top edge
    reflection: [
      'rgba(255, 255, 255, 0.45)',
      'rgba(255, 255, 255, 0.12)',
      'rgba(255, 255, 255, 0.00)',
    ],
    // Subtle inner depth
    innerShadow: [
      'rgba(15, 23, 42, 0.02)',
      'rgba(15, 23, 42, 0.00)',
    ],
    // Crisp highlight on the very top
    topEdge: [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 255, 255, 0.00)',
    ],
    saturation: 1.05,
    brightness: 1.02,
  };

  if (variant === 'header') {
    return {
      ...base,
      blurAmount: isIos ? 28 : 16,
      overlay: isIos 
        ? 'rgba(255, 255, 255, 0.22)' 
        : 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.32)',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 2 },
      reflection: [
        'rgba(255, 255, 255, 0.55)',
        'rgba(255, 255, 255, 0.15)',
        'rgba(255, 255, 255, 0.00)',
      ],
      topEdge: [
        'rgba(255, 255, 255, 0.90)',
        'rgba(255, 255, 255, 0.00)',
      ],
    };
  }

  if (variant === 'tabbar') {
    return {
      ...base,
      blurAmount: isIos ? 32 : 18,
      overlay: isIos 
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.28)',
      border: 'rgba(255, 255, 255, 0.35)',
      shadowOpacity: 0.10,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -4 },
      reflection: [
        'rgba(255, 255, 255, 0.50)',
        'rgba(255, 255, 255, 0.18)',
        'rgba(255, 255, 255, 0.00)',
      ],
      saturation: 1.08,
    };
  }

  if (variant === 'activeChip') {
    return {
      ...base,
      blurAmount: isIos ? 22 : 13,
      fallback: 'rgba(52, 211, 153, 0.04)',
      overlay: isIos 
        ? 'rgba(52, 211, 153, 0.15)' 
        : 'rgba(52, 211, 153, 0.20)',
      border: 'rgba(255, 255, 255, 0.40)',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      shadowColor: '#059669',
      reflection: [
        'rgba(255, 255, 255, 0.60)',
        'rgba(167, 243, 208, 0.20)',
        'rgba(52, 211, 153, 0.00)',
      ],
      innerShadow: [
        'rgba(5, 150, 105, 0.08)',
        'rgba(5, 150, 105, 0.00)',
      ],
      topEdge: [
        'rgba(255, 255, 255, 0.95)',
        'rgba(167, 243, 208, 0.20)',
      ],
      saturation: 1.12,
      brightness: 1.04,
    };
  }

  if (variant === 'pill') {
    return {
      ...base,
      blurAmount: isIos ? 20 : 12,
      overlay: isIos 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.18)',
      border: 'rgba(255, 255, 255, 0.25)',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      reflection: [
        'rgba(255, 255, 255, 0.40)',
        'rgba(255, 255, 255, 0.10)',
        'rgba(255, 255, 255, 0.00)',
      ],
    };
  }

  return base;
}