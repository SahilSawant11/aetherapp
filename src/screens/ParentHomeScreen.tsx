import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
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
    backgroundColor: '#F2F5F7',
    overflow: 'hidden',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#D7DEE7',
  },
  main: {
    flex: 1,
    paddingHorizontal: 14,
  },
});
