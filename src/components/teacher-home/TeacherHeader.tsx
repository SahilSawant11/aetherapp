import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BellIcon, MenuIcon } from '../icons/ParentHubIcons';
import { getGlassPalette } from '../parent-home/glassTokens';

type TeacherHeaderProps = {
  name: string;
  isCheckedIn: boolean;
  unreadCount: number;
  onMenuPress: () => void;
};

export function TeacherHeader({
  name,
  isCheckedIn,
  unreadCount,
  onMenuPress,
}: TeacherHeaderProps) {
  const palette = getGlassPalette('header');

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.glass,
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

        <View style={styles.content}>
          <View style={styles.identityWrap}>
            <Pressable hitSlop={8} onPress={onMenuPress} style={styles.menuButton}>
              <MenuIcon color="#64748B" />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.subtitle}>
                {isCheckedIn ? 'CHECKED IN' : 'CHECKED OUT'}
              </Text>
            </View>
          </View>

          <View style={styles.bellWrap}>
            <BellIcon />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  glass: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  content: {
    minHeight: 88,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuButton: {
    padding: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: '#0284C7',
  },
  bellWrap: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
