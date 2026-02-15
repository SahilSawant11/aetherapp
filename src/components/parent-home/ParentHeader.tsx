import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { BellIcon, ChatIcon, MenuIcon } from '../icons/ParentHubIcons';

type ParentHeaderProps = {
  onMenuPress: () => void;
};

export function ParentHeader({ onMenuPress }: ParentHeaderProps) {
  const palette = getPalette();

  return (
    <View style={styles.headerWrap}>
      <View
        style={[
          styles.headerGlass,
          {
            borderColor: palette.border,
            backgroundColor: palette.fallback,
            shadowColor: palette.shadowColor,
            shadowOpacity: palette.shadowOpacity,
          },
        ]}
      >
        <BlurView
          blurType={Platform.OS === 'ios' ? 'ultraThinMaterialLight' : 'light'}
          blurAmount={28}
          reducedTransparencyFallbackColor={palette.fallback}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]} />
        <View style={styles.topEdgeGlow} />
        <LinearGradient
          colors={palette.reflection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onMenuPress} style={styles.menuButton}>
            <MenuIcon color={palette.icon} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: palette.title }]}>Sahil</Text>
            <Text style={styles.headerSubtitle}>ACTIVE SESSION</Text>
          </View>

          <View style={styles.headerActions}>
            <ChatIcon />
            <View>
              <BellIcon />
              <View style={styles.bellDot} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function getPalette() {
  return {
    fallback: 'rgba(248, 252, 255, 0.08)',
    overlay: 'rgba(255, 255, 255, 0.16)',
    border: 'rgba(255, 255, 255, 0.74)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    title: '#1E293B',
    icon: '#64748B',
    reflection: ['rgba(255,255,255,0.82)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.00)'],
  };
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  headerGlass: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  topEdgeGlow: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 6,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  header: {
    height: 86,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 3,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: '#059669',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bellDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#FB7185',
  },
});
