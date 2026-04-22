import { AttendanceState } from '../components/ui/AttendanceCalendar';
import { supabase } from './supabase';
import {
  DEFAULT_PICKUP_PLAN,
  formatAlertTimestamp,
  ParentDashboardAlert,
  ParentDashboardSlot,
  ParentPickupPlan,
  PARENT_ALERTS,
  WEEKDAY_TIMETABLE,
} from './parentDashboard';

export type ParentStudent = {
  id: string;
  name: string;
  gradeLabel: string;
  homeroom: string;
};

export type ParentDashboardData = {
  student: ParentStudent;
  alerts: ParentDashboardAlert[];
  attendance: Record<string, AttendanceState>;
  pickupPlan: ParentPickupPlan;
  timetable: ParentDashboardSlot[];
  isFallback: boolean;
};

type ParentDashboardLoadResult = {
  data: ParentDashboardData;
  helperText: string | null;
};

type ParentStudentLinkRow = {
  student_id: string;
};

type StudentRow = {
  id: string;
  full_name: string;
  grade_label: string | null;
  homeroom: string | null;
};

type StudentAttendanceRow = {
  attended_on: string;
  status: AttendanceState;
};

type StudentTimetableRow = {
  title: string;
  room: string;
  start_time: string;
  end_time: string;
};

type StudentPickupPlanRow = {
  gate: string;
  contact_name: string;
  contact_relation: string;
  pickup_time: string;
};

type ParentAlertRow = {
  id: string;
  title: string;
  body: string;
  tone: 'accent' | 'default' | null;
  published_at: string;
};

const DEFAULT_STUDENT: ParentStudent = {
  id: 'sample-student',
  name: 'Rahul',
  gradeLabel: 'Grade 10',
  homeroom: 'Class X B',
};

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

const buildFallbackData = (): ParentDashboardData => ({
  student: DEFAULT_STUDENT,
  alerts: PARENT_ALERTS,
  attendance: SAMPLE_ATTENDANCE,
  pickupPlan: DEFAULT_PICKUP_PLAN,
  timetable: WEEKDAY_TIMETABLE,
  isFallback: true,
});

const normalizeTimeText = (value: string) => value.slice(0, 5);

const buildAttendanceMap = (rows: StudentAttendanceRow[]) =>
  rows.reduce<Record<string, AttendanceState>>((acc, row) => {
    if (row.status === 'present' || row.status === 'absent') {
      acc[row.attended_on] = row.status;
    }
    return acc;
  }, {});

const buildTimetable = (rows: StudentTimetableRow[]) =>
  rows.map(row => ({
    title: row.title,
    room: row.room,
    start: normalizeTimeText(row.start_time),
    end: normalizeTimeText(row.end_time),
  }));

const buildAlerts = (rows: ParentAlertRow[]) =>
  rows.map(row => ({
    id: row.id,
    title: row.title,
    body: row.body,
    tone: row.tone === 'accent' ? ('accent' as const) : ('default' as const),
    time: formatAlertTimestamp(row.published_at),
  }));

export async function loadParentDashboard(
  parentId: string
): Promise<ParentDashboardLoadResult> {
  const fallbackData = buildFallbackData();

  if (!supabase) {
    return {
      data: fallbackData,
      helperText: 'Connect Supabase to replace the sample parent dashboard data.',
    };
  }

  try {
    const { data: linkRow, error: linkError } = await supabase
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', parentId)
      .order('is_primary', { ascending: false })
      .limit(1)
      .maybeSingle<ParentStudentLinkRow>();

    if (linkError || !linkRow?.student_id) {
      return {
        data: fallbackData,
        helperText:
          'Link a student to this parent account in Supabase to show live attendance, schedule, and pickup details.',
      };
    }

    const studentId = linkRow.student_id;

    const [studentResult, attendanceResult, timetableResult, pickupResult, alertsResult] =
      await Promise.all([
        supabase
          .from('students')
          .select('id, full_name, grade_label, homeroom')
          .eq('id', studentId)
          .maybeSingle<StudentRow>(),
        supabase
          .from('student_attendance')
          .select('attended_on, status')
          .eq('student_id', studentId)
          .order('attended_on', { ascending: false })
          .limit(180),
        supabase
          .from('student_timetable')
          .select('title, room, start_time, end_time')
          .eq('student_id', studentId)
          .order('weekday', { ascending: true })
          .order('start_time', { ascending: true }),
        supabase
          .from('student_pickup_plans')
          .select('gate, contact_name, contact_relation, pickup_time')
          .eq('student_id', studentId)
          .order('pickup_date', { ascending: false })
          .limit(1)
          .maybeSingle<StudentPickupPlanRow>(),
        supabase
          .from('parent_alerts')
          .select('id, title, body, tone, published_at')
          .order('published_at', { ascending: false })
          .limit(6),
      ]);

    const student = studentResult.data
      ? {
          id: studentResult.data.id,
          name: studentResult.data.full_name,
          gradeLabel: studentResult.data.grade_label ?? fallbackData.student.gradeLabel,
          homeroom: studentResult.data.homeroom ?? fallbackData.student.homeroom,
        }
      : fallbackData.student;

    const attendance =
      attendanceResult.error || !attendanceResult.data?.length
        ? fallbackData.attendance
        : buildAttendanceMap(attendanceResult.data as StudentAttendanceRow[]);

    const timetable =
      timetableResult.error || !timetableResult.data?.length
        ? fallbackData.timetable
        : buildTimetable(timetableResult.data as StudentTimetableRow[]);

    const pickupPlan =
      pickupResult.error || !pickupResult.data
        ? fallbackData.pickupPlan
        : {
            gate: pickupResult.data.gate,
            contactName: pickupResult.data.contact_name,
            contactRelation: pickupResult.data.contact_relation,
            time: normalizeTimeText(pickupResult.data.pickup_time),
          };

    const alerts =
      alertsResult.error || !alertsResult.data?.length
        ? fallbackData.alerts
        : buildAlerts(alertsResult.data as ParentAlertRow[]);

    const hadFallbacks = Boolean(
      studentResult.error ||
        attendanceResult.error ||
        timetableResult.error ||
        pickupResult.error ||
        alertsResult.error
    );

    return {
      data: {
        student,
        alerts,
        attendance,
        pickupPlan,
        timetable,
        isFallback: false,
      },
      helperText: hadFallbacks
        ? 'Some parent records are still using sample values while the rest of the dashboard loads from Supabase.'
        : null,
    };
  } catch {
    return {
      data: fallbackData,
      helperText:
        'Showing the sample parent dashboard for now. Apply the new Supabase schema to enable live parent data.',
    };
  }
}
