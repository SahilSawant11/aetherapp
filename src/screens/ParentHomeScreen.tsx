import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParentBottomTabs, ParentTabKey } from '../components/parent-home/ParentBottomTabs';
import { ParentCalendarTab } from '../components/parent-home/ParentCalendarTab';
import { ParentHeader } from '../components/parent-home/ParentHeader';
import { ParentSidebar } from '../components/parent-home/ParentSidebar';
import { ParentStatusSection } from '../components/parent-home/ParentStatusSection';

function ComingSoonTab({ title }: { title: string }) {
  return (
    <View style={styles.comingSoonWrap}>
      <Text style={styles.comingSoonTitle}>{title}</Text>
      <Text style={styles.comingSoonText}>This tab will be added in the next step.</Text>
    </View>
  );
}

export function ParentHomeScreen() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTabKey>('home');
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

  const handleTabPress = (tab: ParentTabKey) => {
    if (tab === activeTab) {
      return;
    }

    Animated.timing(tabContentPhase, {
      toValue: 0.82,
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
          colors={['#8FD8B5', '#BCEBD3', '#67C79D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(5, 150, 105, 0.34)', 'rgba(5, 150, 105, 0.14)', 'rgba(5, 150, 105, 0.00)']}
          start={{ x: 0.24, y: 0 }}
          end={{ x: 0.78, y: 0.36 }}
          style={styles.topTint}
        />
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />
        <View style={styles.bgOrbTopGlass} />
        <View style={styles.bgOrbBottomGlass} />
        <View style={styles.bgOrbHeaderFocus} />
        <View style={styles.bgOrbFooterFocus} />

        <ParentHeader onMenuPress={() => setMenuOpen(true)} />

        <Animated.View
          style={[
            styles.main,
            {
              opacity: tabContentPhase,
              transform: [
                {
                  scale: tabContentPhase.interpolate({
                    inputRange: [0.82, 1],
                    outputRange: [0.987, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {activeTab === 'home' ? <ParentStatusSection /> : null}
          {activeTab === 'calendar' ? <ParentCalendarTab /> : null}
          {activeTab === 'map' ? <ComingSoonTab title="Map" /> : null}
          {activeTab === 'alerts' ? <ComingSoonTab title="Alerts" /> : null}
        </Animated.View>

        <ParentBottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
      </View>

      <ParentSidebar
        isOpen={menuOpen}
        overlayOpacity={overlayOpacity}
        slideX={slideX}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF2',
  },
  panel: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    paddingHorizontal: 14,
  },
  comingSoonWrap: {
    flex: 1,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  comingSoonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  bgOrbOne: {
    position: 'absolute',
    top: -20,
    right: -36,
    width: 210,
    height: 210,
    borderRadius: 210,
    backgroundColor: 'rgba(5, 150, 105, 0.46)',
  },
  bgOrbTwo: {
    position: 'absolute',
    bottom: 58,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(4, 120, 87, 0.48)',
  },
  topTint: {
    ...StyleSheet.absoluteFillObject,
  },
  bgOrbTopGlass: {
    position: 'absolute',
    top: -36,
    left: 70,
    width: 250,
    height: 180,
    borderRadius: 220,
    backgroundColor: 'rgba(34, 197, 94, 0.40)',
  },
  bgOrbBottomGlass: {
    position: 'absolute',
    bottom: -26,
    right: -38,
    width: 260,
    height: 190,
    borderRadius: 230,
    backgroundColor: 'rgba(16, 185, 129, 0.42)',
  },
  bgOrbHeaderFocus: {
    position: 'absolute',
    top: -52,
    right: 16,
    width: 280,
    height: 180,
    borderRadius: 220,
    backgroundColor: 'rgba(20, 184, 166, 0.34)',
  },
  bgOrbFooterFocus: {
    position: 'absolute',
    bottom: -34,
    left: 40,
    width: 300,
    height: 200,
    borderRadius: 240,
    backgroundColor: 'rgba(52, 211, 153, 0.34)',
  },
});
