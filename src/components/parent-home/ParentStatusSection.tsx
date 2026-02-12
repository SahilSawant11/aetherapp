import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AcademicCapIcon } from '../AcademicCapIcon';
import { colors } from '../../theme/colors';

function SchoolStatusBadge() {
  return (
    <View style={styles.badgeOuter}>
      <View style={styles.badgeInner}>
        <View style={styles.badgeDot} />
      </View>
    </View>
  );
}

export function ParentStatusSection() {
  return (
    <View style={styles.main}>
      <View style={styles.heroCircle}>
        <AcademicCapIcon color="#069669" size={84} />
        <View style={styles.statusBadgeWrap}>
          <SchoolStatusBadge />
        </View>
      </View>

      <Text style={styles.mainTitle}>
        Your child is <Text style={styles.mainTitleHighlight}>in</Text>
        {'\n'}
        <Text style={styles.mainTitleHighlight}>school</Text>
      </Text>

      <Text style={styles.detailLine}>Leo Sterling checked into</Text>
      <Text style={styles.detailLineBold}>
        Room 402 <Text style={styles.detailLine}>at 08:15 AM today.</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    alignItems: 'center',
    paddingTop: 38,
  },
  heroCircle: {
    width: 222,
    height: 222,
    borderRadius: 111,
    backgroundColor: '#BFEAD8',
    borderWidth: 2,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  statusBadgeWrap: {
    position: 'absolute',
    right: 8,
    bottom: 10,
  },
  badgeOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  badgeInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  mainTitle: {
    marginTop: 42,
    textAlign: 'center',
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '500',
    color: '#1E293B',
  },
  mainTitleHighlight: {
    fontWeight: '800',
    color: '#059669',
  },
  detailLine: {
    marginTop: 18,
    fontSize: 12.5,
    lineHeight: 20,
    color: '#64748B',
  },
  detailLineBold: {
    marginTop: 7,
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '800',
    textAlign: 'center',
  },
});
