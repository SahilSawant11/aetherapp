import React, { useEffect, useState } from 'react';
import { SessionProvider, useSession } from './auth/session';
import { syncPushNotificationsForUser } from './lib/notifications';
import { SignInScreen } from './screens/SignInScreen';
import { TeacherHomeScreen } from './screens/TeacherHomeScreen';
import { ParentHomeScreen } from './screens/ParentHomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';

const SPLASH_DURATION_MS = 1800;

function AppRootInner() {
  const [showSplash, setShowSplash] = useState(true);
  const {
    user,
    finishPasswordRecovery,
    isHydrating,
    isPasswordRecovery,
    isSupabaseConfigured,
    resetPasswordForEmail,
    signInWithPassword,
    signOut,
    signUpParent,
    updatePassword,
  } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isCancelled = false;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const syncNotifications = async () => {
      const cleanup = await syncPushNotificationsForUser(user);
      if (isCancelled) {
        cleanup?.();
        return;
      }
      unsubscribeTokenRefresh = cleanup ?? undefined;
    };

    syncNotifications().catch(error => {
      if (__DEV__) {
        console.warn('[notifications] Unable to sync push notifications', error);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribeTokenRefresh?.();
    };
  }, [user]);

  if (showSplash || isHydrating) {
    return <SplashScreen />;
  }

  if (isPasswordRecovery) {
    return (
      <ResetPasswordScreen
        onFinish={finishPasswordRecovery}
        onUpdatePassword={updatePassword}
      />
    );
  }

  if (user == null) {
    return (
      <SignInScreen
        isSupabaseConfigured={isSupabaseConfigured}
        onPasswordReset={resetPasswordForEmail}
        onSignIn={signInWithPassword}
        onSignUpParent={signUpParent}
      />
    );
  }

  if (user.role === 'parent') {
    return <ParentHomeScreen user={user} onSignOut={signOut} />;
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
