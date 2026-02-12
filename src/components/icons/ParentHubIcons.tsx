import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

export function MenuIcon({ color = '#64748B' }: { color?: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H20" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M4 12H20" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M4 17H20" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function ChatIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.25 11.5C20.25 6.94 16.52 3.25 12 3.25C7.48 3.25 3.75 6.94 3.75 11.5C3.75 14.04 4.92 16.31 6.75 17.83V20.75L9.68 18.98C10.4 19.2 11.18 19.32 12 19.32C16.52 19.32 20.25 15.63 20.25 11.5Z"
        stroke="#94A3B8"
        strokeWidth={1.9}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BellIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.75C9.1 3.75 6.75 6.1 6.75 9V11.28C6.75 12.07 6.47 12.83 5.95 13.43L4.72 14.85C4.04 15.64 4.6 16.88 5.66 16.88H18.34C19.4 16.88 19.96 15.64 19.28 14.85L18.05 13.43C17.53 12.83 17.25 12.07 17.25 11.28V9C17.25 6.1 14.9 3.75 12 3.75Z"
        stroke="#94A3B8"
        strokeWidth={1.9}
        strokeLinejoin="round"
      />
      <Path d="M10.25 19.4C10.65 20.09 11.28 20.5 12 20.5C12.72 20.5 13.35 20.09 13.75 19.4" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

export function ClockIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.emerald500} strokeWidth={2} />
      <Path d="M12 7.5V12.5L15 14" stroke={colors.emerald500} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HomeIcon({ active }: { active?: boolean }) {
  const stroke = active ? colors.emerald500 : '#94A3B8';
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M4.75 10.85L12 5L19.25 10.85V19.25H4.75V10.85Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={10} y={13} width={4} height={6.25} rx={1} stroke={stroke} strokeWidth={2} />
    </Svg>
  );
}

export function CalendarIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Rect x={4.5} y={6.5} width={15} height={13} rx={2.2} stroke="#94A3B8" strokeWidth={2} />
      <Path d="M8 4.5V8" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 4.5V8" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <Path d="M4.5 10.5H19.5" stroke="#94A3B8" strokeWidth={2} />
    </Svg>
  );
}

export function AlertIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.75C9.1 3.75 6.75 6.1 6.75 9V11.28C6.75 12.07 6.47 12.83 5.95 13.43L4.72 14.85C4.04 15.64 4.6 16.88 5.66 16.88H18.34C19.4 16.88 19.96 15.64 19.28 14.85L18.05 13.43C17.53 12.83 17.25 12.07 17.25 11.28V9C17.25 6.1 14.9 3.75 12 3.75Z"
        stroke="#94A3B8"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M10.3 19.35C10.68 20 11.31 20.38 12 20.38C12.69 20.38 13.32 20 13.7 19.35" stroke="#94A3B8" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
