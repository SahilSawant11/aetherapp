import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BellIcon, ChatIcon, MenuIcon } from '../icons/ParentHubIcons';
import { getGlassPalette } from './glassTokens';

type ParentHeaderProps = {
  onMenuPress: () => void;
};

export function ParentHeader({ onMenuPress }: ParentHeaderProps) {
  const palette = getGlassPalette('header');
  const titleColor = '#1E293B';
  const iconColor = '#64748B';

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
          blurType={Platform.OS === 'ios' ? palette.blurType : 'light'}
          blurAmount={palette.blurAmount}
          overlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0)' : undefined}
          reducedTransparencyFallbackColor={palette.fallback}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]} />

        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onMenuPress} style={styles.menuButton}>
            <MenuIcon color={iconColor} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: titleColor }]}>Sahil</Text>
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

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 12,
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
