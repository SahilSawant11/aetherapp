import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { getGlassPalette } from '../parent-home/glassTokens';

type TeacherHomeTabProps = {
  isCheckedIn: boolean;
  lastPunchLabel: string;
  shiftCountdownLabel: string | null;
  shiftEndsLabel: string | null;
  onOpenPunch: () => void;
  onOpenCalendar: () => void;
};

const TODAY_SLOTS = [
  { time: '08:30', title: 'Mathematics', section: 'Grade 8A', room: 'Room 204', active: true },
  { time: '10:30', title: 'Science', section: 'Grade 8B', room: 'Lab 1' },
  { time: '12:15', title: 'Mentoring', section: 'Grade 8A', room: 'Room 204' },
  { time: '14:00', title: 'Planning', section: 'Faculty', room: 'Staff Room' },
];

function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const palette = getGlassPalette('header');

  return (
    <View
      style={[
        styles.card,
        style,
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

export function TeacherHomeTab({
  isCheckedIn,
  lastPunchLabel,
  shiftCountdownLabel,
  shiftEndsLabel,
  onOpenPunch,
  onOpenCalendar,
}: TeacherHomeTabProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GlassCard style={styles.heroCard}>
        <Text style={styles.kicker}>Teacher Operations</Text>
        <Text style={styles.heroTitle}>
          {isCheckedIn ? 'You are live for the day.' : 'Punch in to start your shift.'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {isCheckedIn
            ? `Punched in at ${lastPunchLabel}. ${
                shiftEndsLabel
                  ? `Shift ends at ${shiftEndsLabel} with ${shiftCountdownLabel} remaining.`
                  : 'Your 8-hour shift timer is running.'
              }`
            : 'Your first class starts at 08:30 AM. Capture a punch-in selfie before class.'}
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Classes Today</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={onOpenPunch} style={[styles.actionButton, styles.primaryAction]}>
            <Text style={styles.primaryActionText}>Open Punch</Text>
          </Pressable>
          <Pressable onPress={onOpenCalendar} style={styles.actionButton}>
            <Text style={styles.secondaryActionText}>Attendance</Text>
          </Pressable>
        </View>
      </GlassCard>

      <GlassCard>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today&apos;s schedule</Text>
          <Text style={styles.sectionMeta}>08:30 AM to 02:45 PM</Text>
        </View>

        <View style={styles.scheduleColumn}>
          {TODAY_SLOTS.map(slot => (
            <View
              key={`${slot.time}-${slot.title}`}
              style={[styles.scheduleRow, slot.active && styles.scheduleRowActive]}
            >
              <View style={styles.timeBlock}>
                <Text style={styles.timeText}>{slot.time}</Text>
              </View>
              <View style={styles.scheduleTextWrap}>
                <Text style={styles.scheduleTitle}>{slot.title}</Text>
                <Text style={styles.scheduleMeta}>
                  {slot.section} · {slot.room}
                </Text>
              </View>
              {slot.active ? <Text style={styles.liveChip}>Live</Text> : null}
            </View>
          ))}
        </View>
      </GlassCard>
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
  heroCard: {
    minHeight: 250,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statTile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.54)',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.56)',
  },
  primaryAction: {
    backgroundColor: '#2563EB',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryActionText: {
    color: '#1E3A8A',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  scheduleColumn: {
    gap: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  scheduleRowActive: {
    backgroundColor: 'rgba(191, 219, 254, 0.70)',
  },
  timeBlock: {
    width: 58,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  scheduleTextWrap: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  liveChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
