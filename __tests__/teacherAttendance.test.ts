import {
  formatHoursAndMinutes,
  getCompletedShiftCount,
  getCurrentShiftDurationMs,
  getPunchActionBlockReason,
  getTeacherAttendanceState,
  getWorkedDurationMs,
  TeacherAttendanceRecord,
} from '../src/lib/teacherAttendance';

const buildRecord = (
  overrides: Partial<TeacherAttendanceRecord> = {}
): TeacherAttendanceRecord => ({
  id: 'attendance-1',
  teacherId: 'teacher-1',
  punchType: 'in',
  punchedAt: '2026-04-19T08:00:00.000Z',
  latitude: 0,
  longitude: 0,
  locationAccuracyMeters: null,
  selfiePath: 'teacher-1/selfie.jpg',
  devicePlatform: 'ios',
  createdAt: '2026-04-19T08:00:00.000Z',
  ...overrides,
});

describe('teacher attendance rules', () => {
  it('blocks punch out before any punch in', () => {
    expect(getPunchActionBlockReason([], 'out')).toBe(
      'Punch in before you can punch out.'
    );
  });

  it('blocks duplicate punch in while a shift is active', () => {
    const records = [buildRecord()];

    expect(getPunchActionBlockReason(records, 'in', Date.parse('2026-04-19T09:00:00.000Z'))).toBe(
      'You are already checked in. Punch out when your shift is complete.'
    );
  });

  it('marks a very old open shift as needing attention', () => {
    const records = [buildRecord()];
    const nowMs = Date.parse('2026-04-20T01:00:01.000Z');

    expect(getPunchActionBlockReason(records, 'in', nowMs)).toBe(
      'Your last punch in is still open. Punch out to close that shift before starting a new one.'
    );
    expect(getTeacherAttendanceState(records, nowMs)).toMatchObject({
      isCheckedIn: true,
      needsAttention: true,
      statusLabel: 'Needs Punch Out',
    });
  });

  it('calculates the current shift duration from the latest open punch', () => {
    const records = [buildRecord()];

    expect(getCurrentShiftDurationMs(records, Date.parse('2026-04-19T10:30:00.000Z'))).toBe(
      9000000
    );
  });

  it('sums completed and active worked time across punches', () => {
    const records = [
      buildRecord({
        id: '4',
        punchType: 'in',
        punchedAt: '2026-04-19T13:00:00.000Z',
      }),
      buildRecord({
        id: '3',
        punchType: 'out',
        punchedAt: '2026-04-19T12:00:00.000Z',
      }),
      buildRecord({
        id: '2',
        punchType: 'in',
        punchedAt: '2026-04-19T08:00:00.000Z',
      }),
    ];

    const workedMs = getWorkedDurationMs(records, Date.parse('2026-04-19T15:30:00.000Z'));

    expect(workedMs).toBe(23400000);
    expect(formatHoursAndMinutes(workedMs)).toBe('6h 30m');
  });

  it('counts completed shifts from matched in and out records', () => {
    const records = [
      buildRecord({
        id: '4',
        punchType: 'in',
        punchedAt: '2026-04-19T13:00:00.000Z',
      }),
      buildRecord({
        id: '3',
        punchType: 'out',
        punchedAt: '2026-04-19T12:00:00.000Z',
      }),
      buildRecord({
        id: '2',
        punchType: 'in',
        punchedAt: '2026-04-19T08:00:00.000Z',
      }),
    ];

    expect(getCompletedShiftCount(records)).toBe(1);
  });
});
