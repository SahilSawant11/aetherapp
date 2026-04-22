import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { AttendanceCalendar, AttendanceState } from '../ui/AttendanceCalendar';

type ParentCalendarTabProps = {
  attendance: Record<string, AttendanceState>;
  helperText?: string | null;
  studentName: string;
};

export function ParentCalendarTab({
  attendance,
  helperText,
  studentName,
}: ParentCalendarTabProps) {
  return (
    <View style={styles.wrap}>
      <AttendanceCalendar
        attendance={attendance}
        accentColor="#059669"
        title={`${studentName}'s attendance`}
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  helperText: {
    marginTop: 10,
    paddingHorizontal: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontWeight: '600',
  },
});
