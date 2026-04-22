export type ParentActionKey = 'absence' | 'pickup' | 'message';

export type ParentDashboardAction = {
  key: ParentActionKey;
  label: string;
  helper: string;
  detail: string;
};

export type ParentDashboardSlot = {
  title: string;
  room: string;
  start: string;
  end: string;
};

export type ParentDashboardAlert = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone?: 'accent' | 'default';
};

export type ParentPickupPlan = {
  gate: string;
  contactName: string;
  contactRelation: string;
  time: string;
};

export type ParentLectureState = {
  kicker: string;
  title: string;
  room: string;
  time: string;
  progressLabel: string;
};

export const PARENT_DASHBOARD_ACTIONS: ParentDashboardAction[] = [
  {
    key: 'absence',
    label: 'Report an absence',
    helper: 'Let school know before first period.',
    detail: 'Draft a same-day absence note so the class teacher and office have the update before roll call.',
  },
  {
    key: 'pickup',
    label: 'Update pickup contact',
    helper: 'Switch the approved guardian for today.',
    detail: 'Share the new pickup person, arrival window, and any gate instructions with the front office.',
  },
  {
    key: 'message',
    label: 'Send a message to school',
    helper: 'Reach the class teacher or office quickly.',
    detail: 'Prepare a short parent message for class notes, dismissal changes, or a quick follow-up question.',
  },
];

export const PARENT_ALERTS: ParentDashboardAlert[] = [
  {
    id: 'pickup-route',
    title: 'Pickup reminder',
    body: 'Rahul’s dispersal gate opens at 2:45 PM today. Arrive five minutes early to avoid the queue.',
    time: 'Today · 2:15 PM',
    tone: 'accent',
  },
  {
    id: 'notebook',
    title: 'School notice',
    body: 'Math notebooks should be submitted by Wednesday morning.',
    time: 'Today · 10:30 AM',
  },
  {
    id: 'sports-kit',
    title: 'Tomorrow prep',
    body: 'Sports kit is needed for Friday’s practice period.',
    time: 'Yesterday · 6:00 PM',
  },
];

export const WEEKDAY_TIMETABLE: ParentDashboardSlot[] = [
  { title: 'Mathematics', room: 'Class X B', start: '08:30', end: '09:15' },
  { title: 'Science', room: 'Lab 2', start: '09:20', end: '10:05' },
  { title: 'Arts', room: 'Class X B', start: '10:30', end: '11:45' },
  { title: 'English', room: 'Class X B', start: '12:00', end: '12:45' },
  { title: 'History', room: 'Class X B', start: '13:30', end: '14:15' },
  { title: 'Sports', room: 'Ground', start: '14:20', end: '15:05' },
];

export const DEFAULT_PICKUP_PLAN: ParentPickupPlan = {
  gate: 'North Gate',
  contactName: 'Sahil',
  contactRelation: 'Father',
  time: '14:45',
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatTime12Hour = (time: string): string => {
  const [hourText, minuteText] = time.split(':');
  const hour24 = Number(hourText);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minuteText} ${suffix}`;
};

export const formatCountdownFromNow = (time: string, now: Date) => {
  const minutesRemaining = toMinutes(time) - (now.getHours() * 60 + now.getMinutes());
  if (minutesRemaining <= 0) {
    return 'Pickup window is open now';
  }

  const hours = Math.floor(minutesRemaining / 60);
  const minutes = minutesRemaining % 60;

  if (hours === 0) {
    return `Pickup in ${minutes} min`;
  }

  return `Pickup in ${hours}h ${minutes}m`;
};

export const getCurrentLectureState = (
  now: Date,
  timetable: ParentDashboardSlot[] = WEEKDAY_TIMETABLE
): ParentLectureState => {
  const day = now.getDay();
  if (day === 0 || day === 6) {
    return {
      kicker: 'No classes today',
      title: 'Weekend',
      room: 'School closed',
      time: 'Check alerts for campus notices and pickup changes.',
      progressLabel: 'Weekend schedule',
    };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentLecture = timetable.find(slot => {
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    return nowMinutes >= start && nowMinutes < end;
  });

  if (currentLecture) {
    return {
      kicker: 'Currently attending',
      title: currentLecture.title,
      room: currentLecture.room,
      time: `${formatTime12Hour(currentLecture.start)} - ${formatTime12Hour(currentLecture.end)}`,
      progressLabel: 'Live in class',
    };
  }

  const nextLecture = timetable.find(slot => nowMinutes < toMinutes(slot.start));
  if (nextLecture) {
    return {
      kicker: 'Next lecture',
      title: nextLecture.title,
      room: nextLecture.room,
      time: `${formatTime12Hour(nextLecture.start)} - ${formatTime12Hour(nextLecture.end)}`,
      progressLabel: 'Upcoming',
    };
  }

  return {
    kicker: 'No more lectures today',
    title: 'Finished',
    room: 'Student is out of class',
    time: 'School day has ended for today.',
    progressLabel: 'Awaiting pickup',
  };
};

export const formatAlertTimestamp = (value: string, now: Date = new Date()) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const timeLabel = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (parsed >= startOfToday) {
    return `Today · ${timeLabel}`;
  }

  if (parsed >= startOfYesterday) {
    return `Yesterday · ${timeLabel}`;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
