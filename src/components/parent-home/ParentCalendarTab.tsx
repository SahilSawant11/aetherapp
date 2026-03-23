import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from '../ui/SurfaceCard';

type AttendanceState = 'present' | 'absent';

type CalendarCell = {
  key: string;
  day: number | null;
  dateKey?: string;
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SAMPLE_ATTENDANCE: Record<string, AttendanceState> = {
  '2026-02-03': 'present',
  '2026-02-04': 'present',
  '2026-02-05': 'present',
  '2026-02-06': 'present',
  '2026-02-10': 'absent',
  '2026-02-11': 'present',
  '2026-02-12': 'present',
  '2026-02-13': 'absent',
};

const attendanceCellColor = (status: AttendanceState) => {
  if (status === 'present') {
    return '#34D399';
  }
  return '#FCA5A5';
};

const attendanceTextColor = (status: AttendanceState) => {
  if (status === 'present') {
    return '#065F46';
  }
  return '#7F1D1D';
};

const dateKeyFor = (year: number, month: number, day: number) => {
  const monthText = `${month + 1}`.padStart(2, '0');
  const dayText = `${day}`.padStart(2, '0');
  return `${year}-${monthText}-${dayText}`;
};

const buildCalendarGrid = (year: number, month: number): CalendarCell[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ key: `empty-start-${i}`, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: `day-${day}`, day, dateKey: dateKeyFor(year, month, day) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, day: null });
  }

  return cells;
};

export function ParentCalendarTab() {
  const [displayDate, setDisplayDate] = useState(() => new Date());

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const today = new Date();

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const weeks = useMemo(() => {
    const chunks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      chunks.push(cells.slice(i, i + 7));
    }
    return chunks;
  }, [cells]);

  const goToPreviousMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <SurfaceCard style={styles.calendarWrap}>
      <View style={styles.headerRow}>
        <Pressable onPress={goToPreviousMonth} style={styles.monthNavBtn}>
          <Text style={styles.monthNavText}>{'<'}</Text>
        </Pressable>

        <Text style={styles.monthTitle}>{`${MONTH_LABELS[month]} ${year}`}</Text>

        <Pressable onPress={goToNextMonth} style={styles.monthNavBtn}>
          <Text style={styles.monthNavText}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekHeaderRow}>
        {WEEK_DAYS.map(day => (
          <Text key={day} style={styles.weekHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map(cell => {
              const isToday =
                cell.day != null &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                cell.day === today.getDate();

              const status = cell.dateKey ? SAMPLE_ATTENDANCE[cell.dateKey] : undefined;

              return (
                <View key={cell.key} style={styles.daySlot}>
                  {cell.day != null ? (
                    <View
                      style={[
                        styles.dayCircle,
                        status && { backgroundColor: attendanceCellColor(status) },
                        isToday && styles.todayCircle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          status && { color: attendanceTextColor(status) },
                          isToday && styles.todayText,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: attendanceCellColor('present') }]} />
          <Text style={styles.legendLabel}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: attendanceCellColor('absent') }]} />
          <Text style={styles.legendLabel}>Absent</Text>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  calendarWrap: {
    flex: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D8E2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F766E',
  },
  monthTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  grid: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
  },
  daySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: '78%',
    maxWidth: 46,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: '78%',
    maxWidth: 46,
    aspectRatio: 1,
  },
  todayCircle: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  todayText: {
    color: '#065F46',
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
