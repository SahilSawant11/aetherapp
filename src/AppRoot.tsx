import React, { useEffect, useState } from 'react';
import { ParentHomeScreen } from './screens/ParentHomeScreen';
import { SplashScreen } from './screens/SplashScreen';

const SPLASH_DURATION_MS = 1800;

export function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <ParentHomeScreen />;
}
