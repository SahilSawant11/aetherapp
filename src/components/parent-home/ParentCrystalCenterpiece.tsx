import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import {
  Camera,
  DefaultLight,
  FilamentScene,
  FilamentView,
  Model,
  useCameraManipulator,
} from 'react-native-filament';

const CRYSTAL_SOURCE = require('../../assets/models/aether-crystal.glb');

function CrystalScene() {
  const pinchDistanceRef = useRef<number | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const grabActiveRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef<number | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });

  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: [0, 0.18, 4.25],
    targetPosition: [0, 0.0, 0],
    upVector: [0, 1, 0],
    orbitSpeed: [0.0036, 0.0036],
    zoomSpeed: [0.00085],
  });

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current != null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    if (cameraManipulator == null || !grabActiveRef.current) {
      return;
    }

    stopInertia();

    let vx = velocityRef.current.x;
    let vy = velocityRef.current.y;
    const decay = 0.93;
    const minSpeed = 5;

    const step = () => {
      vx *= decay;
      vy *= decay;

      lastPointRef.current = {
        x: lastPointRef.current.x + vx / 60,
        y: lastPointRef.current.y + vy / 60,
      };

      cameraManipulator.grabUpdate(lastPointRef.current.x, lastPointRef.current.y);

      if (Math.hypot(vx, vy) < minSpeed) {
        cameraManipulator.grabEnd();
        grabActiveRef.current = false;
        inertiaFrameRef.current = null;
        return;
      }

      inertiaFrameRef.current = requestAnimationFrame(step);
    };

    inertiaFrameRef.current = requestAnimationFrame(step);
  }, [cameraManipulator, stopInertia]);

  const getPinchDistance = (
    touches: Array<{ locationX: number; locationY: number }>
  ): number | null => {
    if (touches.length < 2) {
      return null;
    }

    const first = touches[0];
    const second = touches[1];
    const dx = second.locationX - first.locationX;
    const dy = second.locationY - first.locationY;
    return Math.hypot(dx, dy);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          if (cameraManipulator == null) return;
          stopInertia();

          const touches = event.nativeEvent.touches;
          const pinchDistance = getPinchDistance(touches);
          if (pinchDistance != null) {
            pinchDistanceRef.current = pinchDistance;
            if (grabActiveRef.current) {
              cameraManipulator.grabEnd();
              grabActiveRef.current = false;
            }
            return;
          }

          const { locationX, locationY } = event.nativeEvent;
          lastPointRef.current = { x: locationX, y: locationY };
          lastMoveTimeRef.current = event.nativeEvent.timestamp ?? null;
          velocityRef.current = { x: 0, y: 0 };
          if (grabActiveRef.current) {
            cameraManipulator.grabEnd();
          }
          cameraManipulator.grabBegin(locationX, locationY, false);
          grabActiveRef.current = true;
        },
        onPanResponderMove: (event) => {
          if (cameraManipulator == null) return;

          const touches = event.nativeEvent.touches;
          const pinchDistance = getPinchDistance(touches);
          if (pinchDistance != null) {
            const previousDistance = pinchDistanceRef.current;
            pinchDistanceRef.current = pinchDistance;

            if (previousDistance != null) {
              const delta = pinchDistance - previousDistance;
              const first = touches[0];
              const second = touches[1];
              const centerX = (first.locationX + second.locationX) / 2;
              const centerY = (first.locationY + second.locationY) / 2;
              cameraManipulator.scroll(centerX, centerY, -delta * 0.24);
            }

            if (grabActiveRef.current) {
              cameraManipulator.grabEnd();
              grabActiveRef.current = false;
            }
            return;
          }

          pinchDistanceRef.current = null;
          const { locationX, locationY } = event.nativeEvent;
          const now = event.nativeEvent.timestamp ?? Date.now();
          const lastTime = lastMoveTimeRef.current ?? now;
          const dt = Math.max((now - lastTime) / 1000, 1 / 120);

          if (!grabActiveRef.current) {
            cameraManipulator.grabBegin(locationX, locationY, false);
            grabActiveRef.current = true;
            velocityRef.current = { x: 0, y: 0 };
          } else {
            const rawVx = (locationX - lastPointRef.current.x) / dt;
            const rawVy = (locationY - lastPointRef.current.y) / dt;
            velocityRef.current = {
              x: velocityRef.current.x * 0.72 + rawVx * 0.28,
              y: velocityRef.current.y * 0.72 + rawVy * 0.28,
            };
          }

          lastPointRef.current = { x: locationX, y: locationY };
          lastMoveTimeRef.current = now;
          cameraManipulator.grabUpdate(locationX, locationY);
        },
        onPanResponderRelease: () => {
          pinchDistanceRef.current = null;
          if (grabActiveRef.current) {
            startInertia();
          } else {
            cameraManipulator?.grabEnd();
          }
        },
        onPanResponderTerminate: () => {
          pinchDistanceRef.current = null;
          stopInertia();
          cameraManipulator?.grabEnd();
          grabActiveRef.current = false;
        },
      }),
    [cameraManipulator, startInertia, stopInertia]
  );

  useEffect(() => {
    return () => {
      stopInertia();
      if (grabActiveRef.current) {
        cameraManipulator?.grabEnd();
        grabActiveRef.current = false;
      }
    };
  }, [cameraManipulator, stopInertia]);

  const renderCallback = useCallback(
    (frameInfo: { timeSinceLastFrame: number }) => {
      'worklet';
      cameraManipulator?.update(frameInfo.timeSinceLastFrame);
    },
    [cameraManipulator]
  );

  return (
    <View style={styles.sceneWrap} {...panResponder.panHandlers}>
      <FilamentView style={styles.sceneView} renderCallback={renderCallback}>
        <Camera cameraManipulator={cameraManipulator} near={0.05} far={25} />
        <DefaultLight />

        <Model
          source={CRYSTAL_SOURCE}
          shouldReleaseSourceData={false}
          transformToUnitCube
          rotate={[0.1, 0.2, 0.1]}
          translate={[0, 0.02, 0]}
          scale={[0.98, 1.2, 0.98]}
          castShadow
          receiveShadow
        />
      </FilamentView>
    </View>
  );
}

export function ParentCrystalCenterpiece() {
  const idleFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(idleFloat, {
          toValue: -5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(idleFloat, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    return () => {
      floatLoop.stop();
    };
  }, [idleFloat]);

  return (
    <View style={styles.main}>
      <View style={styles.faintGlow} />

      <Animated.View
        style={[
          styles.sceneShell,
          {
            transform: [{ translateY: idleFloat }],
          },
        ]}
      >
        <FilamentScene>
          <CrystalScene />
        </FilamentScene>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: 248,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneShell: {
    width: 248,
    height: 248,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  sceneWrap: {
    flex: 1,
  },
  sceneView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  faintGlow: {
    position: 'absolute',
    width: 204,
    height: 204,
    borderRadius: 102,
    backgroundColor: '#0FAE72',
    opacity: 0.08,
    shadowColor: '#10B981',
    shadowOpacity: 0.34,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
