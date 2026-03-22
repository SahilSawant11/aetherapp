import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { getGlassPalette } from './glassTokens';

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
  const panelGlass = getGlassPalette('header');

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
    <View
      style={[
        styles.calendarWrap,
        {
          borderColor: panelGlass.border,
          backgroundColor: panelGlass.fallback,
          shadowColor: panelGlass.shadowColor,
          shadowOpacity: panelGlass.shadowOpacity,
        },
      ]}
    >
      <BlurView
        blurType={Platform.OS === 'ios' ? panelGlass.blurType : 'light'}
        blurAmount={panelGlass.blurAmount}
        overlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0)' : undefined}
        reducedTransparencyFallbackColor={panelGlass.fallback}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: panelGlass.overlay }]} />

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
    </View>
  );
}

const styles = StyleSheet.create({
  calendarWrap: {
    flex: 1,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
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
    backgroundColor: 'rgba(255,255,255,0.55)',
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
    borderColor: 'rgba(148, 163, 184, 0.24)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: '78%',
    maxWidth: 46,
    aspectRatio: 1,
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: '#0F766E',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  todayText: {
    color: '#064E3B',
  },
  legendRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  legendLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});
