import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { getGlassPalette } from '../parent-home/glassTokens';

type AttendanceState = 'present' | 'absent' | 'late';

type CalendarCell = {
  key: string;
  day: number | null;
  dateKey?: string;
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SAMPLE_ATTENDANCE: Record<string, AttendanceState> = {
  '2026-02-02': 'present',
  '2026-02-03': 'present',
  '2026-02-04': 'late',
  '2026-02-05': 'present',
  '2026-02-06': 'present',
  '2026-02-09': 'present',
  '2026-02-10': 'absent',
  '2026-02-11': 'present',
  '2026-02-12': 'late',
  '2026-02-13': 'present',
};

const stateBg = (status: AttendanceState) => {
  if (status === 'present') return '#86EFAC';
  if (status === 'late') return '#FDE68A';
  return '#FECACA';
};

const stateText = (status: AttendanceState) => {
  if (status === 'present') return '#166534';
  if (status === 'late') return '#92400E';
  return '#991B1B';
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

export function TeacherCalendarTab() {
  const palette = getGlassPalette('header');
  const [displayDate, setDisplayDate] = useState(() => new Date(2026, 1, 1));
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const weeks = useMemo(() => {
    const chunks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      chunks.push(cells.slice(i, i + 7));
    }
    return chunks;
  }, [cells]);

  return (
    <View
      style={[
        styles.wrap,
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

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{`${MONTH_LABELS[month]} ${year}`}</Text>
          <Pressable
            onPress={() => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>{'>'}</Text>
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
                const status = cell.dateKey ? SAMPLE_ATTENDANCE[cell.dateKey] : undefined;
                return (
                  <View key={cell.key} style={styles.daySlot}>
                    {cell.day != null ? (
                      <View style={[styles.dayCircle, status && { backgroundColor: stateBg(status) }]}>
                        <Text style={[styles.dayText, status && { color: stateText(status) }]}>
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
            <Text style={styles.summaryMetric}>22 Present</Text>
            <Text style={styles.summaryMetric}>1 Absent</Text>
            <Text style={styles.summaryMetric}>2 Late</Text>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: stateBg('present') }]} />
            <Text style={styles.legendLabel}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: stateBg('late') }]} />
            <Text style={styles.legendLabel}>Late</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: stateBg('absent') }]} />
            <Text style={styles.legendLabel}>Absent</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  monthTitle: {
    fontSize: 18,
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
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: '78%',
    maxWidth: 46,
    aspectRatio: 1,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  summaryCard: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  summaryMetric: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  legendRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
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
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});
