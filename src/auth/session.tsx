import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseConfig } from '../config/supabase';
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

type PasswordResetPayload = {
  email: string;
};

type UpdatePasswordPayload = {
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
  isPasswordRecovery: boolean;
  signInWithPassword: (payload: SignInPayload) => Promise<AuthResult>;
  resetPasswordForEmail: (payload: PasswordResetPayload) => Promise<AuthResult>;
  updatePassword: (payload: UpdatePasswordPayload) => Promise<AuthResult>;
  finishPasswordRecovery: () => Promise<void>;
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

const recoveryParamsFromUrl = (url: string) => {
  const parameterParts = [
    url.split('#')[1],
    url.split('?')[1]?.split('#')[0],
  ].filter((part): part is string => Boolean(part));

  const params: Record<string, string> = {};

  parameterParts.forEach(part => {
    part.split('&').forEach(pair => {
      const [rawKey, ...rawValueParts] = pair.split('=');

      if (!rawKey) {
        return;
      }

      const key = decodeURIComponent(rawKey);
      const value = decodeURIComponent(rawValueParts.join('=').replace(/\+/g, ' '));
      params[key] = value;
    });
  });

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  const type = params.type;
  const errorDescription = params.error_description;

  return {
    accessToken,
    refreshToken,
    isRecoveryLink: type === 'recovery' || url.startsWith(supabaseConfig.passwordResetRedirectUrl),
    errorDescription,
  };
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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsHydrating(false);
      return;
    }

    const client = supabase;

    const syncSession = async (nextUser: User | null) => {
      if (!nextUser) {
        setUser(null);
        return;
      }

      const resolvedUser = await resolveAppUser(nextUser);
      setUser(resolvedUser);
    };

    const handlePasswordRecoveryUrl = async (url: string) => {
      const { accessToken, refreshToken, isRecoveryLink, errorDescription } =
        recoveryParamsFromUrl(url);

      if (!isRecoveryLink) {
        return;
      }

      if (errorDescription) {
        setIsPasswordRecovery(false);
        return;
      }

      if (!accessToken || !refreshToken) {
        return;
      }

      setIsPasswordRecovery(true);
      const { data, error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setIsPasswordRecovery(false);
        setUser(null);
        return;
      }

      await syncSession(data.user);
    };

    client.auth
      .getSession()
      .then(async ({ data }) => {
        await syncSession(data.session?.user ?? null);
        setIsHydrating(false);
      })
      .catch(() => {
        setUser(null);
        setIsHydrating(false);
      });

    Linking.getInitialURL()
      .then(url => {
        if (url) {
          return handlePasswordRecoveryUrl(url);
        }
      })
      .catch(() => undefined);

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handlePasswordRecoveryUrl(url).catch(() => {
        setIsPasswordRecovery(false);
      });
    });

    const { data: subscription } = client.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        syncSession(session?.user ?? null).catch(() => {
          setUser(null);
        });
      }
    );

    return () => {
      linkingSubscription.remove();
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isHydrating,
      isSupabaseConfigured,
      isPasswordRecovery,
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
      resetPasswordForEmail: async ({ email }) => {
        if (!supabase || !isSupabaseConfigured) {
          return {
            error:
              'Supabase is not configured yet. Add your project URL and anon key in src/config/supabase.ts.',
          };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: supabaseConfig.passwordResetRedirectUrl,
        });

        if (error) {
          return { error: error.message };
        }

        return {
          error: null,
          message: 'Password reset email sent. Check your inbox for the secure reset link.',
        };
      },
      updatePassword: async ({ password }) => {
        if (!supabase || !isSupabaseConfigured) {
          return {
            error:
              'Supabase is not configured yet. Add your project URL and anon key in src/config/supabase.ts.',
          };
        }

        const { error } = await supabase.auth.updateUser({ password });

        return { error: error?.message ?? null };
      },
      finishPasswordRecovery: async () => {
        setIsPasswordRecovery(false);

        if (!supabase || !isSupabaseConfigured) {
          setUser(null);
          return;
        }

        await supabase.auth.signOut();
        setUser(null);
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
    [isHydrating, isPasswordRecovery, user]
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
