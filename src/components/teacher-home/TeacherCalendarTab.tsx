import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { AttendanceCalendar, AttendanceState } from '../ui/AttendanceCalendar';

type TeacherCalendarTabProps = {
  teacherId: string;
};

type RawTeacherAttendanceRecord = {
  punched_at: string;
  punch_type: 'in' | 'out';
};

const MONTH_ATTENDANCE_SELECT = 'punched_at, punch_type';

const dateKeyFor = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildAttendanceMap = (
  records: RawTeacherAttendanceRecord[]
): Record<string, AttendanceState> => {
  const punchesByDay = new Map<string, Set<'in' | 'out'>>();

  records.forEach(record => {
    const parsed = new Date(record.punched_at);
    if (Number.isNaN(parsed.getTime())) {
      return;
    }

    const dateKey = dateKeyFor(parsed);
    const current = punchesByDay.get(dateKey) ?? new Set<'in' | 'out'>();
    current.add(record.punch_type);
    punchesByDay.set(dateKey, current);
  });

  const result: Record<string, AttendanceState> = {};

  punchesByDay.forEach((punches, dateKey) => {
    result[dateKey] = punches.has('in') && punches.has('out') ? 'present' : 'absent';
  });

  return result;
};

export function TeacherCalendarTab({ teacherId }: TeacherCalendarTabProps) {
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const [attendance, setAttendance] = useState<Record<string, AttendanceState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAttendanceForMonth = async () => {
      if (!supabase) {
        if (!isCancelled) {
          setAttendance({});
          setErrorMessage('Supabase is not configured.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const monthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
      const monthEnd = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const { data, error } = await supabase
        .from('teacher_attendance')
        .select(MONTH_ATTENDANCE_SELECT)
        .eq('teacher_id', teacherId)
        .gte('punched_at', monthStart.toISOString())
        .lte('punched_at', monthEnd.toISOString())
        .order('punched_at', { ascending: true });

      if (isCancelled) {
        return;
      }

      if (error) {
        setAttendance({});
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setAttendance(buildAttendanceMap((data ?? []) as RawTeacherAttendanceRecord[]));
      setIsLoading(false);
    };

    loadAttendanceForMonth().catch(loadError => {
      if (isCancelled) {
        return;
      }

      setAttendance({});
      setErrorMessage(loadError instanceof Error ? loadError.message : 'Unable to load attendance.');
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [displayDate, teacherId]);

  const helperText = useMemo(() => {
    if (isLoading) {
      return 'Loading attendance for the selected month.';
    }

    if (errorMessage) {
      return errorMessage;
    }

    return 'Weekends are marked present by default. Weekdays need both punch-in and punch-out.';
  }, [errorMessage, isLoading]);

  return (
    <View style={styles.wrap}>
      <AttendanceCalendar
        attendance={attendance}
        accentColor="#2563EB"
        title="Teacher attendance"
        displayDate={displayDate}
        onDisplayDateChange={setDisplayDate}
        weekendsArePresent
        fillMissingWeekdaysAsAbsent
      />

      <View style={styles.footer}>
        {isLoading ? <ActivityIndicator size="small" color="#2563EB" /> : null}
        <Text style={[styles.helperText, errorMessage ? styles.errorText : null]}>{helperText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  errorText: {
    color: '#B91C1C',
  },
});
