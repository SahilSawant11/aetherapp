import React, { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path } from 'react-native-svg';
import { ParentCrystalCenterpiece } from './ParentCrystalCenterpiece';
import { getGlassPalette } from './glassTokens';

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
      kicker: 'NO CLASSES TODAY',
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
      kicker: 'CURRENTLY ATTENDING',
      title: currentLecture.title,
      room: currentLecture.room,
      time: `${to12Hour(currentLecture.start)} - ${to12Hour(currentLecture.end)}`,
    };
  }

  const nextLecture = WEEKDAY_TIMETABLE.find(slot => nowMinutes < toMinutes(slot.start));
  if (nextLecture) {
    return {
      kicker: 'NEXT LECTURE',
      title: nextLecture.title,
      room: nextLecture.room,
      time: `${to12Hour(nextLecture.start)} - ${to12Hour(nextLecture.end)}`,
    };
  }

  return {
    kicker: 'NO MORE LECTURES TODAY',
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
  const pillGlass = getGlassPalette('pill');
  const lecture = getCurrentLectureState();

  return (
    <View style={styles.main}>
      <View style={styles.heroWrap}>
        <ParentCrystalCenterpiece />
      </View>

      <Text style={styles.kicker}>{lecture.kicker}</Text>
      <Text style={styles.classTitle}>{lecture.title}</Text>

      <View
        style={[
          styles.locationPill,
          {
            backgroundColor: pillGlass.fallback,
            borderColor: pillGlass.border,
            shadowColor: pillGlass.shadowColor,
            shadowOpacity: pillGlass.shadowOpacity,
          },
        ]}
      >
        <BlurView
          blurType={Platform.OS === 'ios' ? pillGlass.blurType : 'light'}
          blurAmount={pillGlass.blurAmount}
          overlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0)' : undefined}
          reducedTransparencyFallbackColor={pillGlass.fallback}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: pillGlass.overlay }]} />
        <View style={styles.locationPillContent}>
          <LocationPinIcon />
          <Text style={styles.locationText}>{lecture.room}</Text>
        </View>
      </View>

      <Text style={styles.timeText}>{lecture.time}</Text>
    </View>
  );
}

export const ParentStatusSection = memo(ParentStatusSectionComponent);

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
    letterSpacing: 4,
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
    paddingHorizontal: 26,
    height: 74,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  locationPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
