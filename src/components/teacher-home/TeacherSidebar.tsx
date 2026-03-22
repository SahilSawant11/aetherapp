import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TeacherTabKey } from './TeacherBottomTabs';

type TeacherSidebarProps = {
  activeTab: TeacherTabKey;
  isOpen: boolean;
  name: string;
  onClose: () => void;
  onSignOut: () => void;
  onTabSelect: (tab: TeacherTabKey) => void;
  overlayOpacity: Animated.Value;
  slideX: Animated.Value;
};

function SidebarItem({
  active,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.sidebarItem}>
      <Text style={active ? styles.sidebarItemTextActive : styles.sidebarItemText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TeacherSidebar({
  activeTab,
  isOpen,
  name,
  onClose,
  onSignOut,
  onTabSelect,
  overlayOpacity,
  slideX,
}: TeacherSidebarProps) {
  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.menuOverlay, { opacity: overlayOpacity }]}>
        <Pressable onPress={onClose} style={styles.menuOverlayTap} />
      </Animated.View>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideX }] }]}>
        <LinearGradient
          colors={['#DDEBFF', '#EFF7FF', '#DDFCF4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            'rgba(37, 99, 235, 0.22)',
            'rgba(56, 189, 248, 0.16)',
            'rgba(16, 185, 129, 0.00)',
          ]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 0.38 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.sidebarContent}>
          <View style={styles.sidebarHeader}>
            <View style={styles.avatarWrap}>
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
              <Text style={styles.sidebarTitle}>Teacher Workspace</Text>
              <Text style={styles.sidebarSubtitle}>{name}</Text>
            </View>
          </View>

          <SidebarItem
            active={activeTab === 'home'}
            label="Home"
            onPress={() => onTabSelect('home')}
          />
          <SidebarItem
            active={activeTab === 'punch'}
            label="Selfie Punch"
            onPress={() => onTabSelect('punch')}
          />
          <SidebarItem
            active={activeTab === 'calendar'}
            label="Calendar"
            onPress={() => onTabSelect('calendar')}
          />
          <SidebarItem
            active={activeTab === 'notifications'}
            label="Notifications"
            onPress={() => onTabSelect('notifications')}
          />

          <View style={styles.sidebarFooter}>
            <Pressable
              style={styles.signOutButton}
              onPress={() => {
                onClose();
                onSignOut();
              }}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  menuOverlayTap: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 290,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 5, height: 0 },
    elevation: 8,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 18,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1D4ED8',
    fontWeight: '800',
    fontSize: 15,
  },
  sidebarTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '800',
  },
  sidebarSubtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  sidebarItem: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  sidebarItemTextActive: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '800',
  },
  sidebarItemText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
  },
  sidebarFooter: {
    marginTop: 'auto',
    marginBottom: 22,
    gap: 10,
  },
  signOutButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  signOutButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '800',
  },
  closeButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  closeButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '800',
  },
});
