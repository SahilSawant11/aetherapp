import React from 'react';
import { AttendanceCalendar, AttendanceState } from '../ui/AttendanceCalendar';

const SAMPLE_ATTENDANCE: Record<string, AttendanceState> = {
  '2026-03-02': 'present',
  '2026-03-03': 'present',
  '2026-03-04': 'present',
  '2026-03-05': 'absent',
  '2026-03-06': 'present',
  '2026-03-09': 'present',
  '2026-03-10': 'present',
  '2026-03-11': 'absent',
  '2026-03-12': 'present',
  '2026-03-13': 'present',
};

export function ParentCalendarTab() {
  return (
    <AttendanceCalendar
      attendance={SAMPLE_ATTENDANCE}
      accentColor="#059669"
      initialDate={new Date(2026, 2, 1)}
      title="Student attendance"
    />
  );
}
