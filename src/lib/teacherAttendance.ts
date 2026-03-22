export const TEACHER_SHIFT_DURATION_MS = 8 * 60 * 60 * 1000;
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
