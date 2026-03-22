import React, { useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path, Rect } from 'react-native-svg';
import { AlertIcon, CalendarIcon, HomeIcon } from '../icons/ParentHubIcons';
import { getGlassPalette } from '../parent-home/glassTokens';

export type TeacherTabKey = 'home' | 'punch' | 'calendar' | 'notifications';

type TeacherBottomTabsProps = {
  activeTab: TeacherTabKey;
  onTabPress: (tab: TeacherTabKey) => void;
};

const TABS: Array<{ key: TeacherTabKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'punch', label: 'Punch' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'notifications', label: 'Alerts' },
];

const PADDING = 8;

function PunchIcon({ active }: { active?: boolean }) {
  const stroke = active ? '#2563EB' : '#94A3B8';
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Rect x={5.25} y={4.5} width={13.5} height={15} rx={2.4} stroke={stroke} strokeWidth={1.9} />
      <Path d="M8.25 8H15.75" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M8.25 11.5H13.5" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M10.5 15.5L12 17L14.75 13.75" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TeacherBottomTabs({
  activeTab,
  onTabPress,
}: TeacherBottomTabsProps) {
  const palette = getGlassPalette('tabbar');
  const chipPalette = getGlassPalette('activeChip');
  const [barWidth, setBarWidth] = useState(0);
  const chipTranslateX = useRef(new Animated.Value(PADDING)).current;

  const activeIndex = useMemo(
    () => Math.max(0, TABS.findIndex(tab => tab.key === activeTab)),
    [activeTab]
  );

  const innerWidth = Math.max(0, barWidth - PADDING * 2);
  const slotWidth = innerWidth > 0 ? innerWidth / TABS.length : 0;

  React.useEffect(() => {
    if (slotWidth <= 0) {
      return;
    }

    Animated.spring(chipTranslateX, {
      toValue: PADDING + slotWidth * activeIndex,
      tension: 88,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, chipTranslateX, slotWidth]);

  const onLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const renderIcon = (tabKey: TeacherTabKey, active: boolean) => {
    if (tabKey === 'home') {
      return <HomeIcon active={active} />;
    }
    if (tabKey === 'punch') {
      return <PunchIcon active={active} />;
    }
    if (tabKey === 'calendar') {
      return <CalendarIcon active={active} />;
    }
    return <AlertIcon active={active} />;
  };

  return (
    <View style={styles.wrap}>
      <View
        onLayout={onLayout}
        style={[
          styles.bar,
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

        {slotWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeChip,
              {
                width: slotWidth,
                transform: [{ translateX: chipTranslateX }],
                borderColor: chipPalette.border,
                backgroundColor: chipPalette.fallback,
              },
            ]}
          >
            <BlurView
              blurType={Platform.OS === 'ios' ? chipPalette.blurType : 'light'}
              blurAmount={chipPalette.blurAmount}
              overlayColor={Platform.OS === 'android' ? 'rgba(0,0,0,0)' : undefined}
              reducedTransparencyFallbackColor={chipPalette.fallback}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: chipPalette.overlay }]} />
          </Animated.View>
        ) : null}

        {TABS.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={styles.tabItem}
            >
              <View style={styles.tabContent}>
                {renderIcon(tab.key, isActive)}
                <Text style={isActive ? styles.activeLabel : styles.label}>
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 14,
  },
  bar: {
    height: 76,
    paddingHorizontal: 8,
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeChip: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 0,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
  },
});
