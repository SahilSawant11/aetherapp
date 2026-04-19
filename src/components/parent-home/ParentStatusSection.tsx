import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  DEFAULT_PICKUP_PLAN,
  formatCountdownFromNow,
  formatTime12Hour,
  getCurrentLectureState,
  PARENT_DASHBOARD_ACTIONS,
} from '../../lib/parentDashboard';
import { ParentPickupCard } from './ParentPickupCard';
import { SurfaceCard } from '../ui/SurfaceCard';

type ParentStatusSectionProps = {
  alertCount: number;
  parentName: string;
  studentName?: string;
};

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

function ParentStatusSectionComponent({
  alertCount,
  parentName,
  studentName = 'Rahul',
}: ParentStatusSectionProps) {
  const [now, setNow] = useState(() => new Date());
  const [selectedActionKey, setSelectedActionKey] = useState<'absence' | 'pickup' | 'message'>(
    'absence'
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const lecture = useMemo(() => getCurrentLectureState(now), [now]);
  const selectedAction = useMemo(
    () => PARENT_DASHBOARD_ACTIONS.find(action => action.key === selectedActionKey)!,
    [selectedActionKey]
  );
  const pickupCountdownLabel = useMemo(
    () => formatCountdownFromNow(DEFAULT_PICKUP_PLAN.time, now),
    [now]
  );
  const pickupTimeLabel = `${formatTime12Hour(DEFAULT_PICKUP_PLAN.time)} Today`;
  const todaysDateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const greetingName = parentName.split(' ')[0] ?? parentName;

  return (
    <View style={styles.main}>
      <SurfaceCard tone="accent" accentColor="#059669">
        <Text style={styles.kicker}>{lecture.kicker}</Text>
        <Text style={styles.classTitle}>{studentName} · {lecture.title}</Text>
        <Text style={styles.subhead}>{todaysDateLabel} · {lecture.progressLabel}</Text>
        <View style={styles.locationPill}>
          <LocationPinIcon />
          <Text style={styles.locationText}>{lecture.room}</Text>
        </View>
        <Text style={styles.timeText}>{lecture.time}</Text>
      </SurfaceCard>

      <ParentPickupCard
        countdownLabel={pickupCountdownLabel}
        contactName={greetingName}
        contactRelation={DEFAULT_PICKUP_PLAN.contactRelation}
        gate={DEFAULT_PICKUP_PLAN.gate}
        pickupTimeLabel={pickupTimeLabel}
      />

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Today at a glance</Text>
        <View style={styles.row}>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{todaysDateLabel.split(',')[0]}</Text>
            <Text style={styles.tileLabel}>School day</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{formatTime12Hour(DEFAULT_PICKUP_PLAN.time)}</Text>
            <Text style={styles.tileLabel}>Pickup</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{alertCount}</Text>
            <Text style={styles.tileLabel}>Alerts</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <Text style={styles.sectionTitle}>Parent actions</Text>
        <Text style={styles.actionSummary}>{selectedAction.detail}</Text>
        <View style={styles.actionList}>
          {PARENT_DASHBOARD_ACTIONS.map(action => {
            const isSelected = action.key === selectedAction.key;

            return (
              <Pressable
                key={action.key}
                onPress={() => setSelectedActionKey(action.key)}
                style={[styles.actionButton, isSelected ? styles.actionButtonSelected : null]}
              >
                <Text style={isSelected ? styles.actionItemSelected : styles.actionItem}>
                  {action.label}
                </Text>
                <Text style={styles.actionHelper}>{action.helper}</Text>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>
    </View>
  );
}

export const ParentStatusSection = memo(ParentStatusSectionComponent);

const styles = StyleSheet.create({
  main: {
    width: '100%',
    paddingTop: 18,
    gap: 14,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.8,
    color: '#059669',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  classTitle: {
    marginTop: 14,
    fontSize: 28,
    lineHeight: 34,
    color: '#0F172A',
    fontWeight: '800',
  },
  subhead: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    fontWeight: '700',
  },
  locationPill: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  locationText: {
    fontSize: 16,
    color: '#34445F',
    fontWeight: '600',
  },
  timeText: {
    marginTop: 16,
    fontSize: 13,
    letterSpacing: 1,
    color: '#64748B',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  tileValue: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
  },
  tileLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  actionList: {
    marginTop: 14,
    gap: 12,
  },
  actionSummary: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
    fontWeight: '600',
  },
  actionButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E2EE',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionButtonSelected: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  actionItem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  actionItemSelected: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
  },
  actionHelper: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontWeight: '600',
  },
});
