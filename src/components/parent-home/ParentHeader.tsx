import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { BellIcon, ChatIcon, MenuIcon } from '../icons/ParentHubIcons';

type ParentHeaderProps = {
  onMenuPress: () => void;
};

export function ParentHeader({ onMenuPress }: ParentHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={8} onPress={onMenuPress} style={styles.menuButton}>
        <MenuIcon />
      </Pressable>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>Parent Hub</Text>
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
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 6,
    backgroundColor: colors.white,
    height: 74,
    borderRadius: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 2,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 8.5,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 2,
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
    backgroundColor: '#F43F5E',
  },
});
