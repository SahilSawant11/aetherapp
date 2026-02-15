import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { AlertIcon, CalendarIcon, HomeIcon } from '../icons/ParentHubIcons';
import { getGlassPalette } from './glassTokens';

export function ParentBottomTabs() {
  const palette = getGlassPalette('tabbar');
  const chipPalette = getGlassPalette('activeChip');

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
          blurType={Platform.OS === 'ios' ? palette.blurType : 'light'}
          blurAmount={palette.blurAmount}
          overlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0)' : undefined}
          reducedTransparencyFallbackColor={palette.fallback}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]} />

        <View
          style={[
            styles.tabActive,
            {
              borderColor: chipPalette.border,
              backgroundColor: chipPalette.fallback,
            },
          ]}
        >
          <BlurView
            blurType={Platform.OS === 'ios' ? chipPalette.blurType : 'light'}
            blurAmount={chipPalette.blurAmount}
            overlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0)' : undefined}
            reducedTransparencyFallbackColor={chipPalette.fallback}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: chipPalette.overlay }]} />
          <View style={styles.activeContent}>
            <HomeIcon active />
            <Text style={styles.tabLabelActive}>Home</Text>
          </View>
        </View>

        <View style={styles.tabItem}>
          <CalendarIcon />
          <Text style={styles.tabLabel}>Calendar</Text>
        </View>

        <View style={styles.tabItem}>
          <AlertIcon />
          <Text style={styles.tabLabel}>Alerts</Text>
        </View>
      </View>
    </View>
  );
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
  tabActive: {
    width: 108,
    height: 54,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowColor: '#059669',
    elevation: 3,
  },
  activeContent: {
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
    textShadowColor: 'rgba(255,255,255,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#8A9AB5',
  },
});
