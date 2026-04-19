import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
import { PARENT_ALERTS } from '../lib/parentDashboard';

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

function ParentAlertsTab() {
  return (
    <View style={styles.alertsWrap}>
      {PARENT_ALERTS.map(alert => (
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
    </View>
  );
}

export function ParentHomeScreen({ user, onSignOut }: ParentHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | 'alerts'>('today');
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

  const alertCount = PARENT_ALERTS.length;
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
          {activeTab === 'today' ? (
            <ParentStatusSection alertCount={alertCount} parentName={user.name} />
          ) : null}
          {activeTab === 'timeline' ? <ParentCalendarTab /> : null}
          {activeTab === 'alerts' ? <ParentAlertsTab /> : null}
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
    paddingHorizontal: 16,
  },
  alertsWrap: {
    paddingTop: 18,
    gap: 14,
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
