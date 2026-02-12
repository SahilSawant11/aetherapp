import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentBottomTabs } from '../components/parent-home/ParentBottomTabs';
import { ParentHeader } from '../components/parent-home/ParentHeader';
import { ParentPickupCard } from '../components/parent-home/ParentPickupCard';
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
      <ParentHeader onMenuPress={() => setMenuOpen(true)} />

      <View style={styles.main}>
          <ParentStatusSection />
          <ParentPickupCard />
      </View>

      <ParentBottomTabs />
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
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 18,
  },
  main: {
    flex: 1,
  },
});
