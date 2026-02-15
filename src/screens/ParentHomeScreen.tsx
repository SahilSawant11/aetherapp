import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentBottomTabs } from '../components/parent-home/ParentBottomTabs';
import { ParentHeader } from '../components/parent-home/ParentHeader';
import { ParentSidebar } from '../components/parent-home/ParentSidebar';
import { ParentStatusSection } from '../components/parent-home/ParentStatusSection';

export function ParentHomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideX = useRef(new Animated.Value(-320)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.panel}>
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

        <View style={styles.main}>
          <ParentStatusSection />
        </View>

        <ParentBottomTabs />
      </View>

      <ParentSidebar
        isOpen={menuOpen}
        overlayOpacity={overlayOpacity}
        slideX={slideX}
        onClose={() => setMenuOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF2',
  },
  panel: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 28,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    paddingHorizontal: 14,
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
