import { decode } from 'base64-arraybuffer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { launchCamera } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppUser } from '../auth/session';
import { AlertIcon, CalendarIcon, HomeIcon } from '../components/icons/ParentHubIcons';
import { TeacherHomeTab } from '../components/teacher-home/TeacherHomeTab';
import { TeacherNotificationsTab } from '../components/teacher-home/TeacherNotificationsTab';
import { PunchLogItem, TeacherPunchTab } from '../components/teacher-home/TeacherPunchTab';
import { TeacherSidebar } from '../components/teacher-home/TeacherSidebar';
import { AppBottomTabs, AppTabItem } from '../components/ui/AppBottomTabs';
import { AppHeader } from '../components/ui/AppHeader';
import { supabase } from '../lib/supabase';
import {
  formatActivityLabel,
  formatDuration,
  formatPunchLabel,
  formatShiftDeadline,
  getActivePunchInRecord,
  mapTeacherAttendanceRecord,
  PunchType,
  TEACHER_SELFIE_BUCKET,
  TEACHER_SHIFT_DURATION_MS,
  TeacherAttendanceRecord,
} from '../lib/teacherAttendance';

type TeacherHomeScreenProps = {
  user: AppUser;
  onSignOut: () => void;
};

const ATTENDANCE_SELECT =
  'id, teacher_id, punch_type, punched_at, latitude, longitude, location_accuracy_meters, selfie_path, device_platform, created_at';

const TEACHER_TABS: Array<AppTabItem<'today' | 'attendance' | 'alerts'>> = [
  {
    key: 'today',
    label: 'Today',
    renderIcon: (active, color) => <HomeIcon active={active} activeColor={color} />,
  },
  {
    key: 'attendance',
    label: 'Attendance',
    renderIcon: (active, color) => <CalendarIcon active={active} activeColor={color} />,
  },
  {
    key: 'alerts',
    label: 'Alerts',
    renderIcon: (active, color) => <AlertIcon active={active} activeColor={color} />,
  },
];

type CurrentPosition = {
  coords: {
    accuracy: number | null;
    latitude: number;
    longitude: number;
  };
};

const describeLocation = (record: TeacherAttendanceRecord) =>
  `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`;

const getShiftEndTimestamp = (punchedAt: string) =>
  new Date(new Date(punchedAt).getTime() + TEACHER_SHIFT_DURATION_MS).toISOString();

export function TeacherHomeScreen({ user, onSignOut }: TeacherHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'attendance' | 'alerts'>('today');
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  const [isSubmittingPunch, setIsSubmittingPunch] = useState(false);
  const [punchError, setPunchError] = useState<string | null>(null);
  const [lastCapturedSelfieUri, setLastCapturedSelfieUri] = useState<string | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
  const slideX = useRef(new Animated.Value(-320)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const tabContentPhase = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: menuOpen ? 0 : -320,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: menuOpen ? 1 : 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuOpen, overlayOpacity, slideX]);

  const loadAttendanceRecords = useCallback(async () => {
    if (!supabase) {
      setAttendanceRecords([]);
      setIsAttendanceLoading(false);
      return;
    }

    setIsAttendanceLoading(true);

    const { data, error } = await supabase
      .from('teacher_attendance')
      .select(ATTENDANCE_SELECT)
      .eq('teacher_id', user.id)
      .order('punched_at', { ascending: false })
      .limit(8);

    if (error) {
      setPunchError(error.message);
      setAttendanceRecords([]);
      setIsAttendanceLoading(false);
      return;
    }

    setAttendanceRecords((data ?? []).map(mapTeacherAttendanceRecord));
    setIsAttendanceLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadAttendanceRecords().catch(error => {
      setPunchError(error instanceof Error ? error.message : 'Unable to load attendance.');
      setIsAttendanceLoading(false);
    });
  }, [loadAttendanceRecords]);

  const activePunchInRecord = useMemo(
    () => getActivePunchInRecord(attendanceRecords),
    [attendanceRecords]
  );

  useEffect(() => {
    if (!activePunchInRecord) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [activePunchInRecord]);

  const handleTabPress = (tab: 'today' | 'attendance' | 'alerts') => {
    if (tab === activeTab) {
      return;
    }

    Animated.timing(tabContentPhase, {
      toValue: 0.96,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.spring(tabContentPhase, {
        toValue: 1,
        tension: 76,
        friction: 10,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSidebarTabSelect = (tab: 'today' | 'attendance' | 'alerts') => {
    setMenuOpen(false);
    handleTabPress(tab);
  };

  const lastPunchLabel = formatPunchLabel(attendanceRecords[0]?.punchedAt);
  const shiftEndTimestamp = activePunchInRecord
    ? getShiftEndTimestamp(activePunchInRecord.punchedAt)
    : null;
  const shiftEndsLabel = formatShiftDeadline(shiftEndTimestamp);
  const shiftCountdownLabel = activePunchInRecord
    ? formatDuration(new Date(shiftEndTimestamp!).getTime() - currentTimeMs)
    : null;
  const recentPunches: PunchLogItem[] = attendanceRecords.map(record => ({
    id: record.id,
    label: record.punchType === 'in' ? 'Punch In' : 'Punch Out',
    time: formatPunchLabel(record.punchedAt),
    status: formatActivityLabel(record.punchedAt),
    location: describeLocation(record),
  }));

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  const captureSelfie = async () => {
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      throw new Error('Camera permission is required to capture the attendance selfie.');
    }

    const result = await launchCamera({
      cameraType: 'front',
      includeBase64: true,
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
      maxWidth: 1280,
      maxHeight: 1280,
    });

    if (result.didCancel) {
      return null;
    }

    const asset = result.assets?.[0];
    if (!asset?.base64) {
      throw new Error('Selfie capture did not return an uploadable image.');
    }

    return asset;
  };

  const readCurrentPosition = async (): Promise<CurrentPosition> => {
    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      throw new Error('Location permission is required to record punch coordinates.');
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            coords: {
              accuracy: position.coords.accuracy ?? null,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        error => {
          reject(new Error(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });
  };

  const uploadSelfie = async (teacherId: string, punchType: PunchType, base64: string, mimeType: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const fileExtension = mimeType.includes('png') ? 'png' : 'jpg';
    const filePath = `${teacherId}/${Date.now()}-${punchType}.${fileExtension}`;

    const { error } = await supabase.storage
      .from(TEACHER_SELFIE_BUCKET)
      .upload(filePath, decode(base64), {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return filePath;
  };

  const handlePunch = async (punchType: PunchType) => {
    if (!supabase) {
      setPunchError('Supabase is not configured yet.');
      return;
    }

    if (punchType === 'in' && activePunchInRecord) {
      return;
    }

    if (punchType === 'out' && !activePunchInRecord) {
      return;
    }

    setPunchError(null);
    setIsSubmittingPunch(true);

    try {
      const selfieAsset = await captureSelfie();
      if (!selfieAsset) {
        setIsSubmittingPunch(false);
        return;
      }

      const position = await readCurrentPosition();
      const mimeType = selfieAsset.type ?? 'image/jpeg';
      const selfiePath = await uploadSelfie(
        user.id,
        punchType,
        selfieAsset.base64!,
        mimeType
      );

      const { data, error } = await supabase
        .from('teacher_attendance')
        .insert({
          teacher_id: user.id,
          punch_type: punchType,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_accuracy_meters: position.coords.accuracy,
          selfie_path: selfiePath,
          device_platform: Platform.OS,
        })
        .select(ATTENDANCE_SELECT)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setLastCapturedSelfieUri(selfieAsset.uri ?? null);
      setAttendanceRecords(current => [mapTeacherAttendanceRecord(data), ...current].slice(0, 8));
    } catch (error) {
      setPunchError(
        error instanceof Error ? error.message : 'Unable to complete attendance punch.'
      );
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.panel,
          {
            paddingTop: Math.max(insets.top - 2, 0),
            paddingBottom: Math.max(insets.bottom - 2, 0),
          },
        ]}
      >
        <LinearGradient
          colors={['#EEF4FF', '#F8FBFF', '#F4FAFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            'rgba(37, 99, 235, 0.10)',
            'rgba(56, 189, 248, 0.08)',
            'rgba(16, 185, 129, 0.00)',
          ]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 0.45 }}
          style={StyleSheet.absoluteFill}
        />

        <AppHeader
          title={user.name}
          subtitle={activePunchInRecord ? 'Checked in' : 'Checked out'}
          avatarLabel={user.name
            .split(' ')
            .map(part => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
          accentColor="#2563EB"
          onMenuPress={() => setMenuOpen(true)}
          alertCount={3}
        />

        <Animated.View
          style={[
            styles.main,
            {
              opacity: tabContentPhase,
              transform: [
                {
                  scale: tabContentPhase.interpolate({
                    inputRange: [0.96, 1],
                    outputRange: [0.99, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {activeTab === 'today' ? (
            <TeacherHomeTab
              isCheckedIn={activePunchInRecord != null}
              lastPunchLabel={lastPunchLabel}
              shiftCountdownLabel={shiftCountdownLabel}
              shiftEndsLabel={shiftEndsLabel}
              onOpenPunch={() => handleTabPress('attendance')}
              onOpenCalendar={() => handleTabPress('alerts')}
            />
          ) : null}
          {activeTab === 'attendance' ? (
            <TeacherPunchTab
              isCheckedIn={activePunchInRecord != null}
              isLoading={isAttendanceLoading}
              isSubmitting={isSubmittingPunch}
              lastPunchLabel={lastPunchLabel}
              shiftCountdownLabel={shiftCountdownLabel}
              shiftEndsLabel={shiftEndsLabel}
              lastCapturedSelfieUri={lastCapturedSelfieUri}
              recentPunches={recentPunches}
              errorMessage={punchError}
              onPunchIn={() => handlePunch('in')}
              onPunchOut={() => handlePunch('out')}
            />
          ) : null}
          {activeTab === 'alerts' ? <TeacherNotificationsTab /> : null}
        </Animated.View>

        <AppBottomTabs
          activeTab={activeTab}
          items={TEACHER_TABS}
          activeColor="#2563EB"
          onTabPress={handleTabPress}
        />
      </View>

      <TeacherSidebar
        activeTab={
          activeTab === 'today'
            ? 'home'
            : activeTab === 'attendance'
              ? 'punch'
              : 'notifications'
        }
        isOpen={menuOpen}
        name={user.name}
        onClose={() => setMenuOpen(false)}
        onSignOut={onSignOut}
        onTabSelect={tab =>
          handleSidebarTabSelect(
            tab === 'home' ? 'today' : tab === 'punch' || tab === 'calendar' ? 'attendance' : 'alerts'
          )
        }
        overlayOpacity={overlayOpacity}
        slideX={slideX}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FD',
  },
  panel: {
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
