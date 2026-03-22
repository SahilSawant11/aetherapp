import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import { isSupabaseConfigured, supabaseConfig } from '../config/supabase';

const hasNativeAsyncStorage =
  Platform.OS === 'web' ||
  Boolean(
    TurboModuleRegistry.get('RNAsyncStorage') ??
      NativeModules.RNAsyncStorage ??
      NativeModules.RNCAsyncStorage,
  );

const shouldPersistSession = Platform.OS === 'web' || hasNativeAsyncStorage;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        ...(shouldPersistSession ? { storage: AsyncStorage } : {}),
        autoRefreshToken: shouldPersistSession,
        persistSession: shouldPersistSession,
        detectSessionInUrl: false,
      },
    })
  : null;

if (__DEV__ && !shouldPersistSession) {
  console.warn(
    '[supabase] AsyncStorage native module is unavailable. Session persistence and auto refresh are disabled until the app is rebuilt with AsyncStorage linked.',
  );
}

if (supabase && Platform.OS !== 'web' && shouldPersistSession) {
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
      return;
    }
    supabase.auth.stopAutoRefresh();
  });
}
