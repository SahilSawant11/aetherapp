import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppRole = 'parent' | 'teacher';

export type AppUser = {
  id: string;
  name: string;
  role: AppRole;
  subtitle: string;
};

type SessionContextValue = {
  user: AppUser | null;
  isHydrating: boolean;
  signIn: (user: AppUser) => void;
  signOut: () => void;
};

type DemoAccount = {
  email: string;
  password: string;
  user: AppUser;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);
const SESSION_STORAGE_KEY = 'aether.session';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'parent@aether.app',
    password: 'parent123',
    user: {
      id: 'parent-sahil',
      name: 'Sahil',
      role: 'parent',
      subtitle: 'Parent Hub access',
    },
  },
  {
    email: 'teacher@aether.app',
    password: 'teacher123',
    user: {
      id: 'teacher-ananya',
      name: 'Ananya Sharma',
      role: 'teacher',
      subtitle: 'Teacher Workspace access',
    },
  },
];

export function authenticateDemoUser(
  email: string,
  password: string,
  role: AppRole
): AppUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const matchedAccount = DEMO_ACCOUNTS.find(
    account =>
      account.email === normalizedEmail &&
      account.password === password &&
      account.user.role === role
  );

  return matchedAccount?.user ?? null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored) as AppUser);
        }
      } catch {
        setUser(null);
      } finally {
        setIsHydrating(false);
      }
    };

    restoreSession().catch(() => {
      setIsHydrating(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isHydrating,
      signIn: (nextUser: AppUser) => {
        setUser(nextUser);
        AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser)).catch(
          () => {}
        );
      },
      signOut: () => {
        setUser(null);
        AsyncStorage.removeItem(SESSION_STORAGE_KEY).catch(() => {});
      },
    }),
    [isHydrating, user]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
