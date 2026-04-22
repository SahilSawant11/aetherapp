import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppUser } from '../auth/session';
import { AlertIcon, CalendarIcon, HomeIcon } from '../components/icons/ParentHubIcons';
import { ParentCalendarTab } from '../components/parent-home/ParentCalendarTab';
import { ParentSidebar } from '../components/parent-home/ParentSidebar';
import { ParentStatusSection } from '../components/parent-home/ParentStatusSection';
import { AppBottomTabs, AppTabItem } from '../components/ui/AppBottomTabs';
import { AppHeader } from '../components/ui/AppHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { ParentDashboardAlert } from '../lib/parentDashboard';
import { loadParentDashboard, ParentDashboardData } from '../lib/parentData';

type ParentHomeScreenProps = {
  user: AppUser;
  onSignOut: () => void;
};

const PARENT_TABS: Array<AppTabItem<'today' | 'timeline' | 'alerts'>> = [
  {
    key: 'today',
    label: 'Today',
    renderIcon: (active, color) => <HomeIcon active={active} activeColor={color} />,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    renderIcon: (active, color) => <CalendarIcon active={active} activeColor={color} />,
  },
  {
    key: 'alerts',
    label: 'Alerts',
    renderIcon: (active, color) => <AlertIcon active={active} activeColor={color} />,
  },
];

function ParentAlertsTab({
  alerts,
  helperText,
}: {
  alerts: ParentDashboardAlert[];
  helperText?: string | null;
}) {
  return (
    <View style={styles.alertsWrap}>
      {alerts.map(alert => (
        <SurfaceCard
          key={alert.id}
          tone={alert.tone === 'accent' ? 'accent' : 'default'}
          accentColor="#059669"
        >
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertTime}>{alert.time}</Text>
          </View>
          <Text style={styles.alertBody}>{alert.body}</Text>
        </SurfaceCard>
      ))}
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

export function ParentHomeScreen({ user, onSignOut }: ParentHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | 'alerts'>('today');
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);
  const [dashboardHelperText, setDashboardHelperText] = useState<string | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
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

  useEffect(() => {
    let cancelled = false;

    const hydrateParentDashboard = async () => {
      setIsLoadingDashboard(true);
      const result = await loadParentDashboard(user.id);

      if (cancelled) {
        return;
      }

      setDashboardData(result.data);
      setDashboardHelperText(result.helperText);
      setIsLoadingDashboard(false);
    };

    hydrateParentDashboard();

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const handleTabPress = (tab: 'today' | 'timeline' | 'alerts') => {
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
        tension: 74,
        friction: 10,
        useNativeDriver: true,
      }).start();
    });
  };

  const alertCount = dashboardData?.alerts.length ?? 0;
  const avatarLabel = user.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
          colors={['#F3FBF7', '#F7FCFA', '#EEF9F3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(5, 150, 105, 0.12)', 'rgba(5, 150, 105, 0.06)', 'rgba(5, 150, 105, 0.00)']}
          start={{ x: 0.14, y: 0 }}
          end={{ x: 0.82, y: 0.42 }}
          style={StyleSheet.absoluteFill}
        />

        <AppHeader
          title={user.name}
          subtitle={user.subtitle}
          avatarLabel={avatarLabel}
          accentColor="#059669"
          alertCount={alertCount}
          onMenuPress={() => setMenuOpen(true)}
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
          {isLoadingDashboard ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={styles.loadingText}>Loading parent dashboard...</Text>
            </View>
          ) : null}
          {activeTab === 'today' ? (
            dashboardData ? (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <ParentStatusSection
                  alertCount={alertCount}
                  parentName={user.name}
                  studentName={dashboardData.student.name}
                  gradeLabel={dashboardData.student.gradeLabel}
                  homeroom={dashboardData.student.homeroom}
                  pickupPlan={dashboardData.pickupPlan}
                  timetable={dashboardData.timetable}
                  helperText={dashboardHelperText}
                />
              </ScrollView>
            ) : null
          ) : null}
          {activeTab === 'timeline' && dashboardData ? (
            <ParentCalendarTab
              attendance={dashboardData.attendance}
              helperText={dashboardHelperText}
              studentName={dashboardData.student.name}
            />
          ) : null}
          {activeTab === 'alerts' && dashboardData ? (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ParentAlertsTab alerts={dashboardData.alerts} helperText={dashboardHelperText} />
            </ScrollView>
          ) : null}
        </Animated.View>

        <AppBottomTabs
          activeTab={activeTab}
          items={PARENT_TABS}
          activeColor="#059669"
          onTabPress={handleTabPress}
        />
      </View>

      <ParentSidebar
        activeTab={activeTab}
        isOpen={menuOpen}
        name={user.name}
        overlayOpacity={overlayOpacity}
        slideX={slideX}
        onClose={() => setMenuOpen(false)}
        onSignOut={onSignOut}
        onTabSelect={tab => {
          setMenuOpen(false);
          handleTabPress(tab);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8F4',
  },
  panel: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  alertsWrap: {
    paddingTop: 18,
    gap: 14,
  },
  loadingWrap: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  helperText: {
    paddingHorizontal: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  alertTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  alertTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  alertBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
});
