import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type LandingScreenProps = {
  onGetStarted?: () => void;
};

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroBlock}>
        <Text style={styles.heroTitle}>Welcome to Aether</Text>
        <Text style={styles.heroSubtitle}>
          Clean, calm, and centered. Track your flow and start with intention.
        </Text>
      </View>
      <Pressable onPress={onGetStarted} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  heroBlock: {
    marginTop: 40,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.slate950,
  },
  heroSubtitle: {
    marginTop: 14,
    fontSize: 17,
    lineHeight: 25,
    color: colors.slate600,
  },
  primaryButton: {
    backgroundColor: colors.sky600,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.sky100,
    fontSize: 17,
    fontWeight: '700',
  },
});
