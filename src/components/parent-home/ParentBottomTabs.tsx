import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertIcon, CalendarIcon, HomeIcon } from '../icons/ParentHubIcons';

export function ParentBottomTabs() {
  return (
    <View style={styles.tabBar}>
      <View style={styles.tabActive}>
        <HomeIcon active />
        <Text style={styles.tabLabelActive}>Home</Text>
      </View>

      <View style={styles.tabItem}>
        <CalendarIcon />
        <Text style={styles.tabLabel}>Calendar</Text>
      </View>

      <View style={styles.tabItem}>
        <AlertIcon />
        <Text style={styles.tabLabel}>Alerts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 104,
    marginBottom: 10,
    marginHorizontal: 14,
    padding: 14,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tabActive: {
    width: 108,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#D6F1E7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tabItem: {
    width: 92,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tabLabelActive: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    color: '#059669',
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#8A9AB5',
  },
});
