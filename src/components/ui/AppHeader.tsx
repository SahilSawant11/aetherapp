import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BellIcon, MenuIcon } from '../icons/ParentHubIcons';

type AppHeaderProps = {
  title: string;
  subtitle: string;
  avatarLabel?: string;
  accentColor?: string;
  alertCount?: number;
  onMenuPress: () => void;
};

export function AppHeader({
  title,
  subtitle,
  avatarLabel,
  accentColor = '#2563EB',
  alertCount = 0,
  onMenuPress,
}: AppHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.surface}>
        <View style={styles.left}>
          <Pressable hitSlop={8} onPress={onMenuPress} style={styles.iconButton}>
            <MenuIcon color="#475569" />
          </Pressable>
          {avatarLabel ? (
            <View style={[styles.avatar, { backgroundColor: `${accentColor}14` }]}>
              <Text style={[styles.avatarText, { color: accentColor }]}>{avatarLabel}</Text>
            </View>
          ) : null}
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.subtitle, { color: accentColor }]}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.bellWrap}>
          <BellIcon />
          {alertCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{alertCount > 9 ? '9+' : alertCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  surface: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E2EE',
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconButton: {
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  bellWrap: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
