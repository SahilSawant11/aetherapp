import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { AlertIcon, CalendarIcon, HomeIcon } from '../icons/ParentHubIcons';

export function ParentBottomTabs() {
  const palette = getPalette();

  return (
    <View style={styles.tabBarWrap}>
      <View
        style={[
          styles.tabBar,
          {
            borderColor: palette.border,
            backgroundColor: palette.fallback,
            shadowColor: palette.shadowColor,
            shadowOpacity: palette.shadowOpacity,
          },
        ]}
      >
        <BlurView
          blurType={Platform.OS === 'ios' ? 'ultraThinMaterialLight' : 'light'}
          blurAmount={28}
          reducedTransparencyFallbackColor={palette.fallback}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]} />
        <View style={styles.topEdgeGlow} />
        <LinearGradient
          colors={palette.reflection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.tabActive, { backgroundColor: palette.activeBackground }]}>
          <HomeIcon active />
          <Text style={styles.tabLabelActive}>Home</Text>
        </View>

        <View style={styles.tabItem}>
          <CalendarIcon />
          <Text style={[styles.tabLabel, { color: palette.inactiveLabel }]}>Calendar</Text>
        </View>

        <View style={styles.tabItem}>
          <AlertIcon />
          <Text style={[styles.tabLabel, { color: palette.inactiveLabel }]}>Alerts</Text>
        </View>
      </View>
    </View>
  );
}

function getPalette() {
  return {
    fallback: 'rgba(248, 252, 255, 0.10)',
    overlay: 'rgba(255, 255, 255, 0.16)',
    border: 'rgba(255, 255, 255, 0.74)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    reflection: ['rgba(255,255,255,0.82)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)'],
    activeBackground: 'rgba(214, 241, 231, 0.54)',
    inactiveLabel: '#8A9AB5',
  };
}

const styles = StyleSheet.create({
  tabBarWrap: {
    marginHorizontal: 14,
    marginBottom: 10,
  },
  tabBar: {
    height: 72,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  topEdgeGlow: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 6,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  tabActive: {
    width: 108,
    height: 54,
    borderRadius: 24,
    backgroundColor: '#D6F1E7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  tabItem: {
    width: 92,
    height: 54,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  tabLabelActive: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    color: '#059669',
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
});
