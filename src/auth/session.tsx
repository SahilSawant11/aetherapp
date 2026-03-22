import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../config/supabase';
import { supabase } from '../lib/supabase';

export type AppRole = 'parent' | 'teacher';

export type AppUser = {
  id: string;
  name: string;
  role: AppRole;
  subtitle: string;
};

type SignInPayload = {
  email: string;
  password: string;
};

type ParentSignUpPayload = {
  fullName: string;
  email: string;
  password: string;
};

type AuthResult = {
  error: string | null;
  message?: string;
};

type SessionContextValue = {
  user: AppUser | null;
  isHydrating: boolean;
  isSupabaseConfigured: boolean;
  signInWithPassword: (payload: SignInPayload) => Promise<AuthResult>;
  signUpParent: (payload: ParentSignUpPayload) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const subtitleForRole = (role: AppRole) =>
  role === 'parent' ? 'Parent Hub access' : 'Teacher Workspace access';

const normalizeRole = (value: unknown): AppRole | null => {
  if (value === 'parent' || value === 'teacher') {
    return value;
  }
  return null;
};

const fallbackNameFromEmail = (email: string | undefined) => {
  if (!email) {
    return 'Aether User';
  }
  return email.split('@')[0] ?? 'Aether User';
};

async function resolveAppUser(authUser: User): Promise<AppUser | null> {
  let profileName: string | null = null;
  let profileRole: AppRole | null = null;

  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', authUser.id)
      .maybeSingle();

    profileName =
      typeof data?.full_name === 'string' ? data.full_name : null;
    profileRole = normalizeRole(data?.role);
  }

  const metadataRole = normalizeRole(
    authUser.user_metadata?.role ?? authUser.app_metadata?.role
  );
  const role = profileRole ?? metadataRole;

  if (!role) {
    return null;
  }

  const metadataName =
    typeof authUser.user_metadata?.full_name === 'string'
      ? authUser.user_metadata.full_name
      : null;

  return {
    id: authUser.id,
    name: profileName ?? metadataName ?? fallbackNameFromEmail(authUser.email),
    role,
    subtitle: subtitleForRole(role),
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsHydrating(false);
      return;
    }

    const syncSession = async (nextUser: User | null) => {
      if (!nextUser) {
        setUser(null);
        return;
      }

      const resolvedUser = await resolveAppUser(nextUser);
      setUser(resolvedUser);
    };

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        await syncSession(data.session?.user ?? null);
        setIsHydrating(false);
      })
      .catch(() => {
        setUser(null);
        setIsHydrating(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        syncSession(session?.user ?? null).catch(() => {
          setUser(null);
        });
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isHydrating,
      isSupabaseConfigured,
      signInWithPassword: async ({ email, password }) => {
        if (!supabase || !isSupabaseConfigured) {
          return {
            error:
              'Supabase is not configured yet. Add your project URL and anon key in src/config/supabase.ts.',
          };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        return { error: error?.message ?? null };
      },
      signUpParent: async ({ fullName, email, password }) => {
        if (!supabase || !isSupabaseConfigured) {
          return {
            error:
              'Supabase is not configured yet. Add your project URL and anon key in src/config/supabase.ts.',
          };
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'parent',
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        return {
          error: null,
          message:
            'Account created. Check your email for the Supabase confirmation link.',
        };
      },
      signOut: async () => {
        if (!supabase || !isSupabaseConfigured) {
          setUser(null);
          return;
        }

        await supabase.auth.signOut();
        setUser(null);
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
