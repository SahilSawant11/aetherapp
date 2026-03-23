import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type SurfaceCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'muted' | 'accent';
  accentColor?: string;
};

export function SurfaceCard({
  children,
  style,
  tone = 'default',
  accentColor = '#2563EB',
}: SurfaceCardProps) {
  return (
    <View
      style={[
        styles.card,
        tone === 'muted' ? styles.mutedCard : null,
        tone === 'accent' ? { backgroundColor: `${accentColor}14`, borderColor: `${accentColor}2E` } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E2EE',
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 2,
  },
  mutedCard: {
    backgroundColor: '#F8FAFC',
  },
});
