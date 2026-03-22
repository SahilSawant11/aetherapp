import React, { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import MapView, { type LatLng, type Region } from 'react-native-maps';

const FALLBACK_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function ParentMapTab() {
  const mapRef = useRef<MapView | null>(null);
  const [canShowUserLocation, setCanShowUserLocation] = useState(Platform.OS === 'ios');
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const requestLocationPermission = async () => {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      setCanShowUserLocation(granted === PermissionsAndroid.RESULTS.GRANTED);
    };

    requestLocationPermission().catch(() => {
      setCanShowUserLocation(false);
    });
  }, []);

  const centerOnUserLocation = (location: LatLng) => {
    if (!mapRef.current || hasCenteredRef.current) {
      return;
    }
    hasCenteredRef.current = true;

    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={FALLBACK_REGION}
        showsUserLocation={canShowUserLocation}
        showsMyLocationButton
        onUserLocationChange={event => {
          const coordinate = event.nativeEvent.coordinate;
          if (!coordinate) {
            return;
          }
          centerOnUserLocation(coordinate);
        }}
      />
    </View>
  );
}

// Backward-compatible alias for stale references during hot reload/cache lag.
export const ParentMapTan = ParentMapTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 22,
    overflow: 'hidden',
  },
});
