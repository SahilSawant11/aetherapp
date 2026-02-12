import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AcademicCapIcon } from '../components/AcademicCapIcon';
import { colors } from '../theme/colors';

const SPLASH_ANIMATION_MS = 1800;

export function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: SPLASH_ANIMATION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 900,
        delay: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.4,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [
    footerOpacity,
    logoOpacity,
    logoScale,
    progress,
    ringOpacity,
    ringScale,
    textOpacity,
    textTranslateY,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgLayer}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
      </View>

      <View style={styles.mainContent}>
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <View style={styles.logoTile}>
            <AcademicCapIcon color={colors.white} size={48} />
          </View>
          <Animated.View
            style={[
              styles.logoRing,
              { opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.brandBlock,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.brand}>Aether</Text>
          <Text style={styles.tagline}>Education Systems</Text>
        </Animated.View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </View>

      <Animated.Text style={[styles.footerText, { opacity: footerOpacity }]}>
        Excellence in Every Breath
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  blobTop: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: colors.emerald200,
  },
  blobBottom: {
    position: 'absolute',
    right: '-10%',
    bottom: '-10%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: colors.blue100,
  },
  mainContent: {
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 32,
    position: 'relative',
  },
  logoTile: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: colors.emerald500,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.emerald200,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoRing: {
    position: 'absolute',
    inset: 0,
    borderWidth: 2,
    borderColor: colors.emerald500,
    borderRadius: 30,
  },
  brandBlock: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.slate950,
  },
  tagline: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3.2,
    color: colors.emerald500,
  },
  progressTrack: {
    marginTop: 64,
    width: 192,
    height: 4,
    backgroundColor: colors.slate200,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.emerald500,
  },
  footerText: {
    position: 'absolute',
    bottom: 48,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    color: colors.slate400,
  },
});
