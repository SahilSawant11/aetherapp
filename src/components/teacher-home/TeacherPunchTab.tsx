import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { getGlassPalette } from '../parent-home/glassTokens';

type TeacherPunchTabProps = {
  isCheckedIn: boolean;
  lastPunchLabel: string;
  onPunch: (isCheckedIn: boolean, label: string) => void;
};

const PUNCH_LOG = [
  { label: 'Punch In', time: '8:14 AM', status: 'Verified' },
  { label: 'Punch Out', time: '4:06 PM', status: 'Yesterday' },
  { label: 'Punch In', time: '8:10 AM', status: 'Yesterday' },
];

function PunchCard({ children }: { children: React.ReactNode }) {
  const palette = getGlassPalette('header');

  return (
    <View
      style={[
        styles.card,
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
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

export function TeacherPunchTab({
  isCheckedIn,
  lastPunchLabel,
  onPunch,
}: TeacherPunchTabProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <PunchCard>
        <Text style={styles.sectionTitle}>Selfie punch</Text>
        <Text style={styles.sectionSubtitle}>
          Capture-based attendance flow for staff in and out punches.
        </Text>

        <View style={styles.cameraFrame}>
          <View style={styles.cameraRing}>
            <Text style={styles.cameraHint}>Camera preview</Text>
            <Text style={styles.cameraMeta}>Face alignment and timestamp will appear here.</Text>
          </View>
        </View>
      </PunchCard>

      <PunchCard>
        <View style={styles.stateRow}>
          <View>
            <Text style={styles.statusKicker}>Current status</Text>
            <Text style={styles.statusValue}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </Text>
            <Text style={styles.statusMeta}>Last punch at {lastPunchLabel}</Text>
          </View>
          <View style={[styles.statusChip, isCheckedIn ? styles.statusChipIn : styles.statusChipOut]}>
            <Text style={isCheckedIn ? styles.statusChipTextIn : styles.statusChipTextOut}>
              {isCheckedIn ? 'Live' : 'Off Duty'}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onPunch(true, '8:14 AM')}
            style={[styles.actionButton, styles.primaryAction]}
          >
            <Text style={styles.primaryText}>Punch In</Text>
          </Pressable>
          <Pressable
            onPress={() => onPunch(false, '4:06 PM')}
            style={[styles.actionButton, styles.secondaryAction]}
          >
            <Text style={styles.secondaryText}>Punch Out</Text>
          </Pressable>
        </View>
      </PunchCard>

      <PunchCard>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.logColumn}>
          {PUNCH_LOG.map(item => (
            <View key={`${item.label}-${item.time}-${item.status}`} style={styles.logRow}>
              <View>
                <Text style={styles.logTitle}>{item.label}</Text>
                <Text style={styles.logMeta}>{item.status}</Text>
              </View>
              <Text style={styles.logTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </PunchCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  cameraFrame: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    padding: 18,
  },
  cameraRing: {
    minHeight: 220,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(37, 99, 235, 0.36)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cameraHint: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  cameraMeta: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  statusValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusMeta: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusChipIn: {
    backgroundColor: '#DBEAFE',
  },
  statusChipOut: {
    backgroundColor: '#E2E8F0',
  },
  statusChipTextIn: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusChipTextOut: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#2563EB',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255,255,255,0.64)',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryText: {
    color: '#1E3A8A',
    fontWeight: '800',
    fontSize: 15,
  },
  logColumn: {
    marginTop: 12,
    gap: 10,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  logMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  logTime: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
});
