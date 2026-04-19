import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from '../ui/SurfaceCard';

type TeacherHomeTabProps = {
  isCheckedIn: boolean;
  statusLabel: string;
  statusTone: 'active' | 'inactive' | 'warning';
  statusSubtitle: string;
  lastPunchLabel: string;
  workedHoursLabel: string;
  completedShiftCount: number;
  blockedActionReason: string | null;
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

export function TeacherHomeTab({
  isCheckedIn,
  statusLabel,
  statusTone,
  statusSubtitle,
  lastPunchLabel,
  workedHoursLabel,
  completedShiftCount,
  blockedActionReason,
  shiftCountdownLabel,
  shiftEndsLabel,
  onOpenPunch,
  onOpenCalendar,
}: TeacherHomeTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SurfaceCard style={styles.heroCard} tone="accent" accentColor="#2563EB">
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.heroTitle}>
          {statusTone === 'warning'
            ? 'Your attendance needs a quick cleanup.'
            : isCheckedIn
              ? 'You are checked in and ready.'
              : 'Start the day with one quick punch.'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {statusTone === 'warning'
            ? `${statusSubtitle} Open the attendance tab to finish the pending punch out.`
            : isCheckedIn
              ? `Punched in at ${lastPunchLabel}. ${
                shiftEndsLabel
                  ? `Shift ends at ${shiftEndsLabel}. ${shiftCountdownLabel} remaining.`
                  : 'Your shift timer is running.'
              }`
              : 'Your first class starts at 08:30 AM. Capture a selfie punch before class begins.'}
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{statusLabel}</Text>
            <Text style={styles.statLabel}>Attendance State</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{workedHoursLabel}</Text>
            <Text style={styles.statLabel}>Worked Today</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statValue}>{completedShiftCount}</Text>
            <Text style={styles.statLabel}>Completed Shifts</Text>
          </View>
        </View>

        <View style={styles.summaryPanel}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Last successful punch</Text>
            <Text style={styles.summaryValue}>{lastPunchLabel}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current state</Text>
            <Text
              style={[
                styles.summaryValue,
                statusTone === 'warning' ? styles.summaryValueWarning : null,
              ]}
            >
              {statusSubtitle}
            </Text>
          </View>
          {blockedActionReason ? (
            <View style={styles.warningBanner}>
              <Text style={styles.warningTitle}>Action blocked</Text>
              <Text style={styles.warningBody}>{blockedActionReason}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={onOpenPunch} style={[styles.actionButton, styles.primaryAction]}>
            <Text style={styles.primaryActionText}>Open Attendance</Text>
          </Pressable>
          <Pressable onPress={onOpenCalendar} style={styles.actionButton}>
            <Text style={styles.secondaryActionText}>View Alerts</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Next up</Text>
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
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  heroCard: {
    minHeight: 230,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: '#2563EB',
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
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  summaryPanel: {
    marginTop: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryValueWarning: {
    color: '#B45309',
  },
  warningBanner: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(254, 243, 199, 0.88)',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  warningBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#92400E',
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
    borderWidth: 1,
    borderColor: '#D8E2EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  primaryAction: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
    backgroundColor: '#F8FAFC',
  },
  scheduleRowActive: {
    backgroundColor: '#DBEAFE',
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
