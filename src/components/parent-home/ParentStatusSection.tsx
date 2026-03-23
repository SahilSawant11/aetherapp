import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SurfaceCard } from '../ui/SurfaceCard';

type LectureSlot = {
  title: string;
  room: string;
  start: string;
  end: string;
};

const WEEKDAY_TIMETABLE: LectureSlot[] = [
  { title: 'Mathematics', room: 'Class X B', start: '08:30', end: '09:15' },
  { title: 'Science', room: 'Lab 2', start: '09:20', end: '10:05' },
  { title: 'Arts', room: 'Class X B', start: '10:30', end: '11:45' },
  { title: 'English', room: 'Class X B', start: '12:00', end: '12:45' },
  { title: 'History', room: 'Class X B', start: '13:30', end: '14:15' },
  { title: 'Sports', room: 'Ground', start: '14:20', end: '15:05' },
];

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const to12Hour = (time: string): string => {
  const [hourText, minuteText] = time.split(':');
  const hour24 = Number(hourText);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minuteText} ${suffix}`;
};

const getCurrentLectureState = () => {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) {
    return {
      kicker: 'No classes today',
      title: 'Weekend',
      room: 'School closed',
      time: 'Check calendar for attendance records',
    };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentLecture = WEEKDAY_TIMETABLE.find(slot => {
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    return nowMinutes >= start && nowMinutes < end;
  });

  if (currentLecture) {
    return {
      kicker: 'Currently attending',
      title: currentLecture.title,
      room: currentLecture.room,
      time: `${to12Hour(currentLecture.start)} - ${to12Hour(currentLecture.end)}`,
    };
  }

  const nextLecture = WEEKDAY_TIMETABLE.find(slot => nowMinutes < toMinutes(slot.start));
  if (nextLecture) {
    return {
      kicker: 'Next lecture',
      title: nextLecture.title,
      room: nextLecture.room,
      time: `${to12Hour(nextLecture.start)} - ${to12Hour(nextLecture.end)}`,
    };
  }

  return {
    kicker: 'No more lectures today',
    title: 'Finished',
    room: 'Student is out of class',
    time: 'School day has ended',
  };
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

function ParentStatusSectionComponent() {
  const lecture = getCurrentLectureState();

  return (
    <View style={styles.main}>
      <SurfaceCard tone="accent" accentColor="#059669">
        <Text style={styles.kicker}>{lecture.kicker}</Text>
        <Text style={styles.classTitle}>{lecture.title}</Text>
        <View style={styles.locationPill}>
          <LocationPinIcon />
          <Text style={styles.locationText}>{lecture.room}</Text>
        </View>
        <Text style={styles.timeText}>{lecture.time}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Today at a glance</Text>
        <View style={styles.row}>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>08:30</Text>
            <Text style={styles.tileLabel}>Started</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>14:45</Text>
            <Text style={styles.tileLabel}>Pickup</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>2</Text>
            <Text style={styles.tileLabel}>Alerts</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard tone="muted">
        <Text style={styles.sectionTitle}>Parent actions</Text>
        <View style={styles.actionList}>
          <Text style={styles.actionItem}>Report an absence</Text>
          <Text style={styles.actionItem}>Update pickup contact</Text>
          <Text style={styles.actionItem}>Send a message to school</Text>
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
  actionItem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
});
