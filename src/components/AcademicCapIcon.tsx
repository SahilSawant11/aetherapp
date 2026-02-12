import React from 'react';
import Svg, { Path } from 'react-native-svg';

type AcademicCapIconProps = {
  color?: string;
  size?: number;
};

export function AcademicCapIcon({ color = '#FFFFFF', size = 48 }: AcademicCapIconProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M12 3L1.75 8.5L12 14L22.25 8.5L12 3ZM5.5 10.5V14.75C5.5 16.73 8.41 18.25 12 18.25C15.59 18.25 18.5 16.73 18.5 14.75V10.5L12 14L5.5 10.5Z"
        fill={color}
      />
      <Path
        d="M22.25 8.5V14.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}
