import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SurfaceCard } from '../ui/SurfaceCard';

export type PunchLogItem = {
  id: string;
  label: string;
  time: string;
  status: string;
  location: string;
};

type TeacherPunchTabProps = {
  isCheckedIn: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  lastPunchLabel: string;
  shiftCountdownLabel: string | null;
  shiftEndsLabel: string | null;
  lastCapturedSelfieUri: string | null;
  recentPunches: PunchLogItem[];
  errorMessage: string | null;
  statusMessage: string | null;
  onPunchIn: () => void;
  onPunchOut: () => void;
  onRefresh: () => void;
};

export function TeacherPunchTab({
  isCheckedIn,
  isLoading,
  isSubmitting,
  lastPunchLabel,
  shiftCountdownLabel,
  shiftEndsLabel,
  lastCapturedSelfieUri,
  recentPunches,
  errorMessage,
  statusMessage,
  onPunchIn,
  onPunchOut,
  onRefresh,
}: TeacherPunchTabProps) {
  const punchInDisabled = isLoading || isSubmitting || isCheckedIn;
  const punchOutDisabled = isLoading || isSubmitting || !isCheckedIn;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SurfaceCard>
        <Text style={styles.sectionTitle}>Selfie punch</Text>
        <Text style={styles.sectionSubtitle}>
          Capture a front-camera selfie and stamp the punch with live device coordinates.
        </Text>

        <View style={styles.cameraFrame}>
          <View style={styles.cameraRing}>
            {lastCapturedSelfieUri ? (
              <Image source={{ uri: lastCapturedSelfieUri }} style={styles.selfiePreview} />
            ) : null}
            <View style={lastCapturedSelfieUri ? styles.previewOverlay : undefined}>
              {isSubmitting ? <ActivityIndicator size="small" color="#1D4ED8" /> : null}
              <Text style={styles.cameraHint}>
                {isSubmitting
                  ? 'Attendance in progress'
                  : lastCapturedSelfieUri
                    ? 'Last selfie captured'
                    : 'Camera ready'}
              </Text>
              <Text style={styles.cameraMeta}>
                {statusMessage
                  ? statusMessage
                  : lastCapturedSelfieUri
                  ? 'A new punch will capture a fresh selfie and upload it to the backend.'
                  : 'Punching will open the front camera and require location access.'}
              </Text>
            </View>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {statusMessage && !errorMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}
      </SurfaceCard>

      <SurfaceCard tone="accent" accentColor="#2563EB">
        <View style={styles.stateRow}>
          <View style={styles.statusBlock}>
            <Text style={styles.statusKicker}>Current status</Text>
            <Text style={styles.statusValue}>{isCheckedIn ? 'Checked In' : 'Checked Out'}</Text>
            <Text style={styles.statusMeta}>Last punch at {lastPunchLabel}</Text>
          </View>
          <View style={[styles.statusChip, isCheckedIn ? styles.statusChipIn : styles.statusChipOut]}>
            <Text style={isCheckedIn ? styles.statusChipTextIn : styles.statusChipTextOut}>
              {isCheckedIn ? 'Live' : 'Off Duty'}
            </Text>
          </View>
        </View>

        <View style={styles.shiftPanel}>
          <View style={styles.shiftTile}>
            <Text style={styles.shiftLabel}>Shift timer</Text>
            <Text style={styles.shiftValue}>
              {isCheckedIn ? shiftCountdownLabel ?? '08:00:00' : '08:00:00'}
            </Text>
          </View>
          <View style={styles.shiftTile}>
            <Text style={styles.shiftLabel}>Shift ends</Text>
            <Text style={styles.shiftValue}>{shiftEndsLabel ?? '--:--'}</Text>
          </View>
        </View>

        <Pressable disabled={isLoading || isSubmitting} onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Refreshing attendance...' : 'Refresh attendance'}
          </Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            disabled={punchInDisabled}
            onPress={onPunchIn}
            style={[
              styles.actionButton,
              styles.primaryAction,
              punchInDisabled && styles.actionButtonDisabled,
            ]}
          >
            {isSubmitting && !isCheckedIn ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryText}>Punch In</Text>
            )}
          </Pressable>
          <Pressable
            disabled={punchOutDisabled}
            onPress={onPunchOut}
            style={[
              styles.actionButton,
              styles.secondaryAction,
              punchOutDisabled && styles.actionButtonDisabled,
            ]}
          >
            {isSubmitting && isCheckedIn ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              <Text style={styles.secondaryText}>Punch Out</Text>
            )}
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {recentPunches.length > 0 ? (
          <View style={styles.logColumn}>
            {recentPunches.map(item => (
              <View key={item.id} style={styles.logRow}>
                <View style={styles.logTextWrap}>
                  <Text style={styles.logTitle}>{item.label}</Text>
                  <Text style={styles.logMeta}>
                    {item.status} · {item.location}
                  </Text>
                </View>
                <Text style={styles.logTime}>{item.time}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No punch records yet.</Text>
        )}
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
    padding: 18,
  },
  cameraRing: {
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
    backgroundColor: '#EFF6FF',
  },
  selfiePreview: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  previewOverlay: {
    width: '100%',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    paddingHorizontal: 18,
  },
  cameraHint: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  cameraMeta: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 14,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 14,
    color: '#1D4ED8',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusBlock: {
    flex: 1,
  },
  statusKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: '#2563EB',
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
  shiftPanel: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  shiftTile: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  shiftLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  shiftValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  refreshButton: {
    marginTop: 14,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.48,
  },
  primaryAction: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: '#D8E2EE',
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
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  logTextWrap: {
    flex: 1,
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
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
});
