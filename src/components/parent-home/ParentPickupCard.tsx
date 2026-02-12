import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClockIcon } from '../icons/ParentHubIcons';

export function ParentPickupCard() {
  return (
    <View style={styles.pickupCard}>
      <View style={styles.pickupIconWrap}>
        <ClockIcon />
      </View>
      <View>
        <Text style={styles.pickupLabel}>PICK UP TIME</Text>
        <Text style={styles.pickupTime}>03:30 PM Today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickupCard: {
    marginTop: 46,
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#10B981',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pickupIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pickupLabel: {
    fontSize: 8.5,
    letterSpacing: 2,
    fontWeight: '800',
    color: '#8AA0BE',
  },
  pickupTime: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 26,
    color: '#1E293B',
    fontWeight: '800',
  },
});
