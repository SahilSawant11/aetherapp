import React, { useEffect, useState } from 'react';
import { SessionProvider, useSession } from './auth/session';
import { SignInScreen } from './screens/SignInScreen';
import { TeacherHomeScreen } from './screens/TeacherHomeScreen';
import { ParentHomeScreen } from './screens/ParentHomeScreen';
import { SplashScreen } from './screens/SplashScreen';

const SPLASH_DURATION_MS = 1800;

function AppRootInner() {
  const [showSplash, setShowSplash] = useState(true);
  const {
    user,
    isHydrating,
    isSupabaseConfigured,
    signInWithPassword,
    signOut,
    signUpParent,
  } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || isHydrating) {
    return <SplashScreen />;
  }

  if (user == null) {
    return (
      <SignInScreen
        isSupabaseConfigured={isSupabaseConfigured}
        onSignIn={signInWithPassword}
        onSignUpParent={signUpParent}
      />
    );
  }

  if (user.role === 'parent') {
    return <ParentHomeScreen onSignOut={signOut} />;
  }

  return <TeacherHomeScreen user={user} onSignOut={signOut} />;
}

export function AppRoot() {
  return (
    <SessionProvider>
      <AppRootInner />
    </SessionProvider>
  );
}
