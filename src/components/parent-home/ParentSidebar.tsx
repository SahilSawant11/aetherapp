import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type ParentSidebarProps = {
  isOpen: boolean;
  overlayOpacity: Animated.Value;
  slideX: Animated.Value;
  onClose: () => void;
};

function SidebarItem({ active, label }: { active?: boolean; label: string }) {
  return (
    <Pressable style={styles.sidebarItem}>
      <Text style={active ? styles.sidebarItemTextActive : styles.sidebarItemText}>{label}</Text>
    </Pressable>
  );
}

export function ParentSidebar({ isOpen, overlayOpacity, slideX, onClose }: ParentSidebarProps) {
  return (
    <View pointerEvents={isOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.menuOverlay, { opacity: overlayOpacity }]}>
        <Pressable onPress={onClose} style={styles.menuOverlayTap} />
      </Animated.View>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideX }] }]}>
        <View style={styles.sidebarHeader}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>LS</Text>
          </View>
          <View>
            <Text style={styles.sidebarTitle}>Parent Hub</Text>
            <Text style={styles.sidebarSubtitle}>Leo Sterling</Text>
          </View>
        </View>

        <SidebarItem active label="Home" />
        <SidebarItem label="Calendar" />
        <SidebarItem label="Attendance" />
        <SidebarItem label="Alerts" />
        <SidebarItem label="Settings" />

        <View style={styles.sidebarFooter}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
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
    backgroundColor: '#F8FAFC',
    paddingTop: 56,
    paddingHorizontal: 18,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 5, height: 0 },
    elevation: 8,
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
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#059669',
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
    color: '#059669',
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
  },
  closeButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
  },
  closeButtonText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '800',
  },
});
