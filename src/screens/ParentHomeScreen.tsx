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
          colors={['#DCE9F8', '#ECF2FA', '#D8F2E8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />

        <ParentHeader onMenuPress={() => setMenuOpen(true)} />
        <View style={styles.headerDivider} />

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
    backgroundColor: 'rgba(242, 245, 247, 0.4)',
    overflow: 'hidden',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
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
    backgroundColor: 'rgba(125, 211, 252, 0.30)',
  },
  bgOrbTwo: {
    position: 'absolute',
    bottom: 58,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(110, 231, 183, 0.24)',
  },
});
