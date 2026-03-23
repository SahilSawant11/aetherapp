import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from '../ui/SurfaceCard';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Staff meeting moved',
    body: 'Today’s staff sync has been moved to 4:00 PM in Seminar Hall.',
    time: '10 min ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Punch-out reminder',
    body: 'Remember to complete your selfie punch-out before leaving campus.',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Room reassigned',
    body: 'Period 3 Science for Grade 8B has moved to Lab 1.',
    time: 'Yesterday',
    unread: false,
  },
];

export function TeacherNotificationsTab() {
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);

  const markRead = (id: string) => {
    setItems(current => current.map(item => (item.id === id ? { ...item, unread: false } : item)));
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {items.map(item => (
        <SurfaceCard
          key={item.id}
          tone={item.unread ? 'accent' : 'default'}
          accentColor="#2563EB"
        >
          <View style={styles.rowTop}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.body}>{item.body}</Text>

          <View style={styles.footer}>
            {item.unread ? (
              <View style={styles.unreadChip}>
                <Text style={styles.unreadChipText}>Unread</Text>
              </View>
            ) : (
              <View style={styles.readChip}>
                <Text style={styles.readChipText}>Read</Text>
              </View>
            )}

            {item.unread ? (
              <Pressable onPress={() => markRead(item.id)} style={styles.markButton}>
                <Text style={styles.markButtonText}>Mark read</Text>
              </Pressable>
            ) : null}
          </View>
        </SurfaceCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  unreadChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    textTransform: 'uppercase',
  },
  readChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  readChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  markButton: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  markButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
});
