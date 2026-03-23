import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from './SurfaceCard';

export type AttendanceState = 'present' | 'absent';

type CalendarCell = {
  key: string;
  day: number | null;
  dateKey?: string;
};

type AttendanceCalendarProps = {
  attendance: Record<string, AttendanceState>;
  accentColor?: string;
  initialDate?: Date;
  displayDate?: Date;
  onDisplayDateChange?: (date: Date) => void;
  title?: string;
  weekendsArePresent?: boolean;
  fillMissingWeekdaysAsAbsent?: boolean;
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

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

const stateBg = (status: AttendanceState) => {
  if (status === 'present') {
    return '#86EFAC';
  }

  return '#FECACA';
};

const stateText = (status: AttendanceState) => {
  if (status === 'present') {
    return '#166534';
  }

  return '#991B1B';
};

const isWeekendDateKey = (dateKey: string) => {
  const dayOfWeek = new Date(`${dateKey}T00:00:00`).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export function AttendanceCalendar({
  attendance,
  accentColor = '#2563EB',
  initialDate,
  displayDate,
  onDisplayDateChange,
  title = 'Attendance calendar',
  weekendsArePresent = true,
  fillMissingWeekdaysAsAbsent = false,
}: AttendanceCalendarProps) {
  const [internalDisplayDate, setInternalDisplayDate] = useState(() => initialDate ?? new Date());
  const resolvedDisplayDate = displayDate ?? internalDisplayDate;
  const year = resolvedDisplayDate.getFullYear();
  const month = resolvedDisplayDate.getMonth();
  const today = new Date();

  const setNextDisplayDate = (date: Date) => {
    if (onDisplayDateChange) {
      onDisplayDateChange(date);
      return;
    }

    setInternalDisplayDate(date);
  };

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const weeks = useMemo(() => {
    const chunks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      chunks.push(cells.slice(i, i + 7));
    }
    return chunks;
  }, [cells]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    const cursor = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    while (cursor <= monthEnd) {
      const dayOfWeek = cursor.getDay();
      const dateKey = dateKeyFor(year, month, cursor.getDate());
      const explicitState = attendance[dateKey];
      const resolvedState = explicitState
        ?? (weekendsArePresent && (dayOfWeek === 0 || dayOfWeek === 6) ? 'present' : undefined)
        ?? (fillMissingWeekdaysAsAbsent ? 'absent' : undefined);

      if (resolvedState === 'present') {
        present += 1;
      } else if (resolvedState === 'absent') {
        absent += 1;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return { present, absent };
  }, [attendance, fillMissingWeekdaysAsAbsent, month, weekendsArePresent, year]);

  const kickerStyle = useMemo(() => ({ color: accentColor }), [accentColor]);
  const navTextStyle = useMemo(() => ({ color: accentColor }), [accentColor]);
  const todayCircleStyle = useMemo(() => ({ borderColor: accentColor }), [accentColor]);
  const todayTextStyle = useMemo(() => ({ color: accentColor }), [accentColor]);

  return (
    <SurfaceCard style={styles.wrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.kicker, kickerStyle]}>{title}</Text>
          <Text style={styles.monthTitle}>{`${MONTH_LABELS[month]} ${year}`}</Text>
        </View>

        <View style={styles.navRow}>
          <Pressable
            onPress={() =>
              setNextDisplayDate(
                new Date(resolvedDisplayDate.getFullYear(), resolvedDisplayDate.getMonth() - 1, 1)
              )
            }
            style={styles.navBtn}
          >
            <Text style={[styles.navText, navTextStyle]}>{'<'}</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              setNextDisplayDate(
                new Date(resolvedDisplayDate.getFullYear(), resolvedDisplayDate.getMonth() + 1, 1)
              )
            }
            style={styles.navBtn}
          >
            <Text style={[styles.navText, navTextStyle]}>{'>'}</Text>
          </Pressable>
        </View>
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
              const status = cell.dateKey ? attendance[cell.dateKey] : undefined;
              const resolvedStatus =
                status
                ?? (cell.dateKey && weekendsArePresent && isWeekendDateKey(cell.dateKey)
                  ? 'present'
                  : undefined)
                ?? (cell.dateKey && fillMissingWeekdaysAsAbsent ? 'absent' : undefined);
              const isToday =
                cell.day != null &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                cell.day === today.getDate();

              return (
                <View key={cell.key} style={styles.daySlot}>
                  {cell.day != null ? (
                    <View
                      style={[
                        styles.dayCircle,
                        resolvedStatus ? { backgroundColor: stateBg(resolvedStatus) } : null,
                        isToday ? [styles.todayCircle, todayCircleStyle] : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          resolvedStatus ? { color: stateText(resolvedStatus) } : null,
                          isToday && !status ? todayTextStyle : null,
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

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryMetric}>{summary.present} Present</Text>
          <Text style={styles.summaryMetric}>{summary.absent} Absent</Text>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: stateBg('present') }]} />
          <Text style={styles.legendLabel}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: stateBg('absent') }]} />
          <Text style={styles.legendLabel}>Absent</Text>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  monthTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D8E2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 18,
    fontWeight: '800',
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
    minHeight: 260,
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
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  todayCircle: {
    borderWidth: 2,
  },
  summaryCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 8,
  },
  summaryMetric: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
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
