import React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { getGlassPalette } from '../parent-home/glassTokens';

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
  onPunchIn: () => void;
  onPunchOut: () => void;
};

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
  isLoading,
  isSubmitting,
  lastPunchLabel,
  shiftCountdownLabel,
  shiftEndsLabel,
  lastCapturedSelfieUri,
  recentPunches,
  errorMessage,
  onPunchIn,
  onPunchOut,
}: TeacherPunchTabProps) {
  const punchInDisabled = isLoading || isSubmitting || isCheckedIn;
  const punchOutDisabled = isLoading || isSubmitting || !isCheckedIn;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <PunchCard>
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
                {lastCapturedSelfieUri ? 'Last selfie captured' : 'Camera ready'}
              </Text>
              <Text style={styles.cameraMeta}>
                {lastCapturedSelfieUri
                  ? 'A new punch will capture a fresh selfie and upload it to the backend.'
                  : 'Punching will open the front camera and require location access.'}
              </Text>
            </View>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </PunchCard>

      <PunchCard>
        <View style={styles.stateRow}>
          <View style={styles.statusBlock}>
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
      </PunchCard>

      <PunchCard>
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
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
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
  shiftPanel: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  shiftTile: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.56)',
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
  actionButtonDisabled: {
    opacity: 0.48,
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
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.48)',
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
