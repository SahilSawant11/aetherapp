import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ParentCrystalCenterpiece } from './ParentCrystalCenterpiece';

function LocationPinIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.25C10.5 18.8 6.75 14.9 6.75 11.25C6.75 8.35 9.1 6 12 6C14.9 6 17.25 8.35 17.25 11.25C17.25 14.9 13.5 18.8 12 20.25Z"
        stroke="#069669"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M12 12.8C12.86 12.8 13.55 12.11 13.55 11.25C13.55 10.39 12.86 9.7 12 9.7C11.14 9.7 10.45 10.39 10.45 11.25C10.45 12.11 11.14 12.8 12 12.8Z" fill="#069669" />
    </Svg>
  );
}

export function ParentStatusSection() {
  return (
    <View style={styles.main}>
      <View style={styles.heroWrap}>
        <ParentCrystalCenterpiece />
      </View>

      <Text style={styles.kicker}>CURRENTLY ATTENDING</Text>
      <Text style={styles.classTitle}>Arts</Text>

      <View style={styles.locationPill}>
        <LocationPinIcon />
        <Text style={styles.locationText}>Class X B</Text>
      </View>

      <Text style={styles.timeText}>10:30 AM - 11:45 AM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 18,
  },
  heroWrap: {
    width: '100%',
    minHeight: 328,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    marginTop: 2,
    fontSize: 34 / 3,
    letterSpacing: 6,
    color: '#1CA37A',
    fontWeight: '800',
  },
  classTitle: {
    marginTop: 14,
    fontSize: 60 / 3,
    lineHeight: 66 / 3,
    color: '#0F172A',
    fontWeight: '500',
  },
  locationPill: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 26,
    height: 74,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  locationText: {
    fontSize: 18,
    color: '#34445F',
    fontWeight: '500',
  },
  timeText: {
    marginTop: 16,
    fontSize: 13,
    letterSpacing: 1,
    color: '#8A9AB5',
    fontWeight: '700',
  },
});
