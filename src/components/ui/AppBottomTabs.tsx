import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type AppTabItem<T extends string> = {
  key: T;
  label: string;
  renderIcon: (active: boolean, color: string) => React.ReactNode;
};

type AppBottomTabsProps<T extends string> = {
  activeTab: T;
  items: Array<AppTabItem<T>>;
  activeColor?: string;
  onTabPress: (tab: T) => void;
};

export function AppBottomTabs<T extends string>({
  activeTab,
  items,
  activeColor = '#2563EB',
  onTabPress,
}: AppBottomTabsProps<T>) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {items.map(item => {
          const isActive = item.key === activeTab;

          return (
            <Pressable
              key={item.key}
              onPress={() => onTabPress(item.key)}
              style={[
                styles.tab,
                isActive ? { backgroundColor: `${activeColor}14`, borderColor: `${activeColor}30` } : null,
              ]}
            >
              {item.renderIcon(isActive, activeColor)}
              <Text style={[styles.label, isActive ? { color: activeColor } : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  bar: {
    flexDirection: 'row',
    gap: 10,
    padding: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D8E2EE',
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2,
  },
  tab: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
