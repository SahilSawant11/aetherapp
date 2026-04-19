export const TEACHER_SHIFT_DURATION_MS = 8 * 60 * 60 * 1000;
export const TEACHER_STALE_SHIFT_DURATION_MS = 16 * 60 * 60 * 1000;
export const TEACHER_SELFIE_BUCKET = 'teacher-selfies';

export type PunchType = 'in' | 'out';

export type TeacherAttendanceRecord = {
  id: string;
  teacherId: string;
  punchType: PunchType;
  punchedAt: string;
  latitude: number;
  longitude: number;
  locationAccuracyMeters: number | null;
  selfiePath: string;
  devicePlatform: string | null;
  createdAt: string;
};

export type TeacherAttendanceState = {
  isCheckedIn: boolean;
  needsAttention: boolean;
  statusLabel: string;
  statusTone: 'active' | 'inactive' | 'warning';
  subtitle: string;
  activeRecord: TeacherAttendanceRecord | null;
};

type RawTeacherAttendanceRecord = {
  id: string;
  teacher_id: string;
  punch_type: PunchType;
  punched_at: string;
  latitude: number;
  longitude: number;
  location_accuracy_meters: number | null;
  selfie_path: string;
  device_platform: string | null;
  created_at: string;
};

const punchLabelFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const activityFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const mapTeacherAttendanceRecord = (
  row: RawTeacherAttendanceRecord
): TeacherAttendanceRecord => ({
  id: row.id,
  teacherId: row.teacher_id,
  punchType: row.punch_type,
  punchedAt: row.punched_at,
  latitude: row.latitude,
  longitude: row.longitude,
  locationAccuracyMeters: row.location_accuracy_meters,
  selfiePath: row.selfie_path,
  devicePlatform: row.device_platform,
  createdAt: row.created_at,
});

export const formatPunchLabel = (timestamp: string | null | undefined) => {
  if (!timestamp) {
    return 'No punches yet';
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return 'No punches yet';
  }

  return punchLabelFormatter.format(parsed);
};

export const formatActivityLabel = (timestamp: string) => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown time';
  }

  return activityFormatter.format(parsed);
};

export const getActivePunchInRecord = (
  records: TeacherAttendanceRecord[]
) => {
  const latestRecord = records[0];
  if (!latestRecord || latestRecord.punchType !== 'in') {
    return null;
  }

  return latestRecord;
};

const parseTimestamp = (timestamp: string) => {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getCurrentShiftDurationMs = (
  records: TeacherAttendanceRecord[],
  nowMs: number = Date.now()
) => {
  const activeRecord = getActivePunchInRecord(records);
  if (!activeRecord) {
    return null;
  }

  const parsed = parseTimestamp(activeRecord.punchedAt);
  if (!parsed) {
    return null;
  }

  return Math.max(0, nowMs - parsed.getTime());
};

export const getWorkedDurationMs = (
  records: TeacherAttendanceRecord[],
  nowMs: number = Date.now()
) => {
  let totalMs = 0;
  let openPunchInAt: Date | null = null;

  for (const record of [...records].reverse()) {
    const parsed = parseTimestamp(record.punchedAt);
    if (!parsed) {
      continue;
    }

    if (record.punchType === 'in') {
      openPunchInAt = parsed;
      continue;
    }

    if (!openPunchInAt) {
      continue;
    }

    totalMs += Math.max(0, parsed.getTime() - openPunchInAt.getTime());
    openPunchInAt = null;
  }

  if (openPunchInAt) {
    totalMs += Math.max(0, nowMs - openPunchInAt.getTime());
  }

  return totalMs;
};

export const getCompletedShiftCount = (records: TeacherAttendanceRecord[]) => {
  let completedShifts = 0;
  let openPunchIn = false;

  for (const record of [...records].reverse()) {
    if (record.punchType === 'in') {
      openPunchIn = true;
      continue;
    }

    if (openPunchIn) {
      completedShifts += 1;
      openPunchIn = false;
    }
  }

  return completedShifts;
};

export const formatHoursAndMinutes = (durationMs: number) => {
  const totalMinutes = Math.floor(Math.max(0, durationMs) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

export const getPunchActionBlockReason = (
  records: TeacherAttendanceRecord[],
  punchType: PunchType,
  nowMs: number = Date.now()
) => {
  const latestRecord = records[0];

  if (punchType === 'in') {
    if (!latestRecord || latestRecord.punchType === 'out') {
      return null;
    }

    const shiftDurationMs = getCurrentShiftDurationMs(records, nowMs);
    if (shiftDurationMs != null && shiftDurationMs >= TEACHER_STALE_SHIFT_DURATION_MS) {
      return 'Your last punch in is still open. Punch out to close that shift before starting a new one.';
    }

    return 'You are already checked in. Punch out when your shift is complete.';
  }

  if (!latestRecord || latestRecord.punchType === 'out') {
    return 'Punch in before you can punch out.';
  }

  return null;
};

export const getTeacherAttendanceState = (
  records: TeacherAttendanceRecord[],
  nowMs: number = Date.now()
): TeacherAttendanceState => {
  const activeRecord = getActivePunchInRecord(records);

  if (!activeRecord) {
    return {
      isCheckedIn: false,
      needsAttention: false,
      statusLabel: 'Checked Out',
      statusTone: 'inactive',
      subtitle: 'Ready for the next punch in.',
      activeRecord: null,
    };
  }

  const shiftDurationMs = getCurrentShiftDurationMs(records, nowMs);
  if (shiftDurationMs != null && shiftDurationMs >= TEACHER_STALE_SHIFT_DURATION_MS) {
    return {
      isCheckedIn: true,
      needsAttention: true,
      statusLabel: 'Needs Punch Out',
      statusTone: 'warning',
      subtitle: 'A previous shift is still open and should be closed out.',
      activeRecord,
    };
  }

  return {
    isCheckedIn: true,
    needsAttention: false,
    statusLabel: 'Checked In',
    statusTone: 'active',
    subtitle: 'Shift is active and attendance is up to date.',
    activeRecord,
  };
};

export const formatDuration = (durationMs: number) => {
  const clamped = Math.max(0, durationMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(value => value.toString().padStart(2, '0'))
    .join(':');
};

export const formatShiftDeadline = (timestamp: string | null) => {
  if (!timestamp) {
    return null;
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return punchLabelFormatter.format(parsed);
};
