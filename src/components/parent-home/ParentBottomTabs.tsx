import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { AlertIcon, CalendarIcon, HomeIcon, MapIcon } from '../icons/ParentHubIcons';
import { getGlassPalette } from './glassTokens';

export type ParentTabKey = 'home' | 'calendar' | 'map' | 'alerts';

type ParentBottomTabsProps = {
  activeTab: ParentTabKey;
  onTabPress: (tab: ParentTabKey) => void;
};

const TABS: Array<{ key: ParentTabKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'map', label: 'Map' },
  { key: 'alerts', label: 'Alerts' },
];

const TAB_BAR_HORIZONTAL_PADDING = 8;

export function ParentBottomTabs({ activeTab, onTabPress }: ParentBottomTabsProps) {
  const palette = getGlassPalette('tabbar');
  const chipPalette = getGlassPalette('activeChip');

  const [barWidth, setBarWidth] = useState(0);
  const chipTranslateX = useRef(new Animated.Value(TAB_BAR_HORIZONTAL_PADDING)).current;
  const chipXRef = useRef(TAB_BAR_HORIZONTAL_PADDING);
  const dragStartXRef = useRef(TAB_BAR_HORIZONTAL_PADDING);
  const isDraggingRef = useRef(false);

  const rippleScale = useRef(new Animated.Value(0.3)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const [rippleLeft, setRippleLeft] = useState(TAB_BAR_HORIZONTAL_PADDING);
  const [rippleSize, setRippleSize] = useState(28);

  const activeIndex = useMemo(() => Math.max(0, TABS.findIndex(tab => tab.key === activeTab)), [activeTab]);
  const innerWidth = Math.max(0, barWidth - TAB_BAR_HORIZONTAL_PADDING * 2);
  const slotWidth = innerWidth > 0 ? innerWidth / TABS.length : 0;
  const chipWidth = slotWidth;
  const minX = TAB_BAR_HORIZONTAL_PADDING;
  const maxX = TAB_BAR_HORIZONTAL_PADDING + Math.max(0, innerWidth - chipWidth);

  const xForIndex = (index: number) => TAB_BAR_HORIZONTAL_PADDING + slotWidth * index;

  useEffect(() => {
    const id = chipTranslateX.addListener(({ value }) => {
      chipXRef.current = value;
    });
    return () => {
      chipTranslateX.removeListener(id);
    };
  }, [chipTranslateX]);

  useEffect(() => {
    if (slotWidth <= 0 || isDraggingRef.current) {
      return;
    }

    Animated.spring(chipTranslateX, {
      toValue: xForIndex(activeIndex),
      tension: 88,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, chipTranslateX, slotWidth]);

  const triggerRippleAtIndex = (index: number) => {
    if (slotWidth <= 0) {
      return;
    }

    const size = Math.max(26, Math.min(42, slotWidth * 0.36));
    const centerX = xForIndex(index) + slotWidth / 2;
    setRippleSize(size);
    setRippleLeft(centerX - size / 2);

    rippleScale.setValue(0.2);
    rippleOpacity.setValue(0.36);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1.8,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const indexForX = (x: number) => {
    if (slotWidth <= 0) {
      return activeIndex;
    }
    const rawIndex = Math.round((x - TAB_BAR_HORIZONTAL_PADDING) / slotWidth);
    return Math.max(0, Math.min(TABS.length - 1, rawIndex));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          if (slotWidth <= 0) {
            return;
          }
          isDraggingRef.current = true;
          chipTranslateX.stopAnimation(value => {
            dragStartXRef.current = value;
            chipXRef.current = value;
          });
          triggerRippleAtIndex(activeIndex);
        },
        onPanResponderMove: (_event, gestureState) => {
          if (slotWidth <= 0) {
            return;
          }
          const nextX = Math.max(minX, Math.min(maxX, dragStartXRef.current + gestureState.dx));
          chipTranslateX.setValue(nextX);
        },
        onPanResponderRelease: () => {
          isDraggingRef.current = false;
          const nearestIndex = indexForX(chipXRef.current);
          const nearestTab = TABS[nearestIndex];

          triggerRippleAtIndex(nearestIndex);
          Animated.spring(chipTranslateX, {
            toValue: xForIndex(nearestIndex),
            tension: 88,
            friction: 11,
            useNativeDriver: true,
          }).start();

          if (nearestTab && nearestTab.key !== activeTab) {
            onTabPress(nearestTab.key);
          }
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
          Animated.spring(chipTranslateX, {
            toValue: xForIndex(activeIndex),
            tension: 88,
            friction: 11,
            useNativeDriver: true,
          }).start();
        },
        onShouldBlockNativeResponder: () => true,
      }),
    [activeIndex, activeTab, chipTranslateX, maxX, minX, onTabPress, slotWidth]
  );

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setBarWidth(width);
  };

  const renderIcon = (tabKey: ParentTabKey, active: boolean) => {
    if (tabKey === 'home') {
      return <HomeIcon active={active} />;
    }
    if (tabKey === 'calendar') {
      return <CalendarIcon active={active} />;
    }
    if (tabKey === 'map') {
      return <MapIcon active={active} />;
    }
    return <AlertIcon active={active} />;
  };

  return (
    <View style={styles.tabBarWrap}>
      <View
        onLayout={onTabBarLayout}
        style={[
          styles.tabBar,
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
              styles.dropletPulse,
              {
                width: rippleSize,
                left: rippleLeft,
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
        ) : null}

        {slotWidth > 0 ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.dragHitbox,
              {
                width: chipWidth,
                transform: [{ translateX: chipTranslateX }],
              },
            ]}
          />
        ) : null}

        {slotWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.floatingGlassChip,
              {
                width: chipWidth,
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

        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPressIn={() => triggerRippleAtIndex(index)}
              onPress={() => onTabPress(tab.key)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <View style={styles.tabContent}>
                {renderIcon(tab.key, isActive)}
                <Text style={isActive ? styles.tabLabelActive : styles.tabLabel}>{tab.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    marginHorizontal: 14,
  },
  tabBar: {
    height: 76,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    position: 'relative',
  },
  floatingGlassChip: {
    position: 'absolute',
    top: 8,
    height: 54,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowColor: '#059669',
    elevation: 1,
    zIndex: 1,
  },
  dragHitbox: {
    position: 'absolute',
    top: 8,
    height: 54,
    borderRadius: 22,
    backgroundColor: 'transparent',
    zIndex: 40,
    elevation: 10,
  },
  dropletPulse: {
    position: 'absolute',
    top: 23,
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  tabItem: {
    width: `${100 / TABS.length}%`,
    height: 54,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  tabItemActive: {
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
    shadowColor: '#D1FAE5',
  },
  tabContent: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  tabLabelActive: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#059669',
    textShadowColor: 'rgba(255,255,255,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#8A9AB5',
  },
});
