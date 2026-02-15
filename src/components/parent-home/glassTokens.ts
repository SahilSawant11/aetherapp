import { Platform } from 'react-native';

type GlassVariant = 'header' | 'tabbar' | 'activeChip' | 'pill';

export type GlassPalette = {
  blurType: 'light' | 'ultraThinMaterialLight';
  blurAmount: number;
  fallback: string;
  overlay: string;
  border: string;
  shadowColor: string;
  shadowOpacity: number;
  reflection: string[];
  innerShadow: string[];
  topEdge: string[];
};

export function getGlassPalette(variant: GlassVariant): GlassPalette {
  const isIos = Platform.OS === 'ios';

  const base = {
    blurType: isIos ? 'ultraThinMaterialLight' : 'light',
    blurAmount: isIos ? 22 : 12,
    fallback: 'rgba(167, 243, 208, 0.00)',
    overlay: isIos ? 'rgba(110, 231, 183, 0.012)' : 'rgba(110, 231, 183, 0.025)',
    border: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    reflection: ['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.00)', 'rgba(255,255,255,0.00)'],
    innerShadow: ['rgba(15,23,42,0.00)', 'rgba(15,23,42,0.00)'],
    topEdge: ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.00)'],
  };

  if (variant === 'activeChip') {
    return {
      ...base,
      blurAmount: isIos ? 20 : 12,
      fallback: 'rgba(110, 231, 183, 0.015)',
      overlay: isIos ? 'rgba(52, 211, 153, 0.025)' : 'rgba(52, 211, 153, 0.045)',
      border: 'rgba(255, 255, 255, 0.28)',
      shadowOpacity: 0.05,
      reflection: ['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.00)', 'rgba(255,255,255,0.00)'],
      innerShadow: ['rgba(5,150,105,0.00)', 'rgba(5,150,105,0.00)'],
      topEdge: ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.00)'],
    };
  }

  if (variant === 'pill') {
    return {
      ...base,
      blurAmount: isIos ? 18 : 10,
      fallback: 'rgba(110, 231, 183, 0.008)',
      overlay: isIos ? 'rgba(52, 211, 153, 0.018)' : 'rgba(52, 211, 153, 0.03)',
      border: 'rgba(255, 255, 255, 0.20)',
      shadowOpacity: 0.04,
    };
  }

  if (variant === 'header') {
    return {
      ...base,
      fallback: 'rgba(110, 231, 183, 0.012)',
    };
  }

  return base;
}
