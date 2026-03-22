import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppUser } from '../auth/session';
import { TeacherBottomTabs, TeacherTabKey } from '../components/teacher-home/TeacherBottomTabs';
import { TeacherCalendarTab } from '../components/teacher-home/TeacherCalendarTab';
import { TeacherHeader } from '../components/teacher-home/TeacherHeader';
import { TeacherHomeTab } from '../components/teacher-home/TeacherHomeTab';
import { TeacherNotificationsTab } from '../components/teacher-home/TeacherNotificationsTab';
import { TeacherPunchTab } from '../components/teacher-home/TeacherPunchTab';
import { TeacherSidebar } from '../components/teacher-home/TeacherSidebar';

type TeacherHomeScreenProps = {
  user: AppUser;
  onSignOut: () => void;
};

export function TeacherHomeScreen({ user, onSignOut }: TeacherHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TeacherTabKey>('home');
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [lastPunchLabel, setLastPunchLabel] = useState('8:14 AM');
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

  const handleTabPress = (tab: TeacherTabKey) => {
    if (tab === activeTab) {
      return;
    }

    Animated.timing(tabContentPhase, {
      toValue: 0.86,
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

  const handlePunch = (nextState: boolean, label: string) => {
    setIsCheckedIn(nextState);
    setLastPunchLabel(label);
  };

  const handleSidebarTabSelect = (tab: TeacherTabKey) => {
    setMenuOpen(false);
    handleTabPress(tab);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.panel,
          {
            paddingTop: Math.max(insets.top - 6, 0),
            paddingBottom: Math.max(insets.bottom - 4, 0),
          },
        ]}
      >
        <LinearGradient
          colors={['#DDEBFF', '#EFF7FF', '#DDFCF4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            'rgba(37, 99, 235, 0.22)',
            'rgba(56, 189, 248, 0.16)',
            'rgba(16, 185, 129, 0.00)',
          ]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 0.38 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />
        <View style={styles.bgOrbThree} />

        <TeacherHeader
          name={user.name}
          isCheckedIn={isCheckedIn}
          onMenuPress={() => setMenuOpen(true)}
          unreadCount={3}
        />

        <Animated.View
          style={[
            styles.main,
            {
              opacity: tabContentPhase,
              transform: [
                {
                  scale: tabContentPhase.interpolate({
                    inputRange: [0.86, 1],
                    outputRange: [0.99, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {activeTab === 'home' ? (
            <TeacherHomeTab
              isCheckedIn={isCheckedIn}
              lastPunchLabel={lastPunchLabel}
              onOpenPunch={() => handleTabPress('punch')}
              onOpenCalendar={() => handleTabPress('calendar')}
            />
          ) : null}
          {activeTab === 'punch' ? (
            <TeacherPunchTab
              isCheckedIn={isCheckedIn}
              lastPunchLabel={lastPunchLabel}
              onPunch={handlePunch}
            />
          ) : null}
          {activeTab === 'calendar' ? <TeacherCalendarTab /> : null}
          {activeTab === 'notifications' ? <TeacherNotificationsTab /> : null}
        </Animated.View>

        <TeacherBottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
      </View>

      <TeacherSidebar
        activeTab={activeTab}
        isOpen={menuOpen}
        name={user.name}
        onClose={() => setMenuOpen(false)}
        onSignOut={onSignOut}
        onTabSelect={handleSidebarTabSelect}
        overlayOpacity={overlayOpacity}
        slideX={slideX}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6EEF9',
  },
  panel: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    paddingHorizontal: 14,
  },
  bgOrbOne: {
    position: 'absolute',
    top: -30,
    right: -32,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(37, 99, 235, 0.24)',
  },
  bgOrbTwo: {
    position: 'absolute',
    bottom: 42,
    left: -64,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  bgOrbThree: {
    position: 'absolute',
    top: 120,
    left: 80,
    width: 220,
    height: 160,
    borderRadius: 180,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
});
