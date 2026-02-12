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
    height:74,
    marginBottom: 8,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tabActive: {
    width: 126,
    height: 64,
    borderRadius: 30,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabItem: {
    width: 96,
    height: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabLabelActive: {
    fontSize: 9,
    lineHeight: 22,
    fontWeight: '800',
    color: '#059669',
  },
  tabLabel: {
    fontSize: 9,
    lineHeight: 22,
    fontWeight: '700',
    color: '#8CA0BF',
  },
});
