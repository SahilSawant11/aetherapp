import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { getGlassPalette } from './glassTokens';

type AttendanceState = 'present' | 'absent' | 'late';

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
  '2026-02-05': 'late',
  '2026-02-06': 'present',
  '2026-02-10': 'absent',
  '2026-02-11': 'present',
  '2026-02-12': 'present',
  '2026-02-13': 'late',
};

const attendanceColor = (status: AttendanceState) => {
  if (status === 'present') {
    return '#10B981';
  }
  if (status === 'late') {
    return '#F59E0B';
  }
  return '#EF4444';
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
        {cells.map(cell => {
          const isToday =
            cell.day != null &&
            year === today.getFullYear() &&
            month === today.getMonth() &&
            cell.day === today.getDate();

          const status = cell.dateKey ? SAMPLE_ATTENDANCE[cell.dateKey] : undefined;

          return (
            <View key={cell.key} style={[styles.dayCell, isToday && styles.todayCell]}>
              {cell.day != null ? <Text style={[styles.dayText, isToday && styles.todayText]}>{cell.day}</Text> : null}
              {status ? <View style={[styles.attendanceDot, { backgroundColor: attendanceColor(status) }]} /> : null}
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: attendanceColor('present') }]} />
          <Text style={styles.legendLabel}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: attendanceColor('late') }]} />
          <Text style={styles.legendLabel}>Late</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: attendanceColor('absent') }]} />
          <Text style={styles.legendLabel}>Absent</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarWrap: {
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
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
    marginBottom: 8,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayCell: {
    width: '13.1%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  todayText: {
    color: '#059669',
  },
  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 3,
  },
  legendRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});
