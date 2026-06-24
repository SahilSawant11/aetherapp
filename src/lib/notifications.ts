import { PermissionsAndroid, Platform } from 'react-native';
import type { AppUser } from '../auth/session';
import { supabase } from './supabase';

type MessagingModule = {
  AuthorizationStatus?: {
    AUTHORIZED: number;
    PROVISIONAL: number;
  };
  default: () => MessagingInstance;
};

type MessagingInstance = {
  getToken: () => Promise<string>;
  onTokenRefresh: (listener: (token: string) => void | Promise<void>) => () => void;
  requestPermission?: () => Promise<number>;
  hasPermission?: () => Promise<number>;
  registerDeviceForRemoteMessages?: () => Promise<void>;
  setBackgroundMessageHandler?: (
    handler: (message: unknown) => Promise<void>,
  ) => void;
};

let hasWarnedAboutMissingFirebaseMessaging = false;

function getMessagingModule(): MessagingModule | null {
  try {
    return require('@react-native-firebase/messaging') as MessagingModule;
  } catch (error) {
    if (__DEV__ && !hasWarnedAboutMissingFirebaseMessaging) {
      hasWarnedAboutMissingFirebaseMessaging = true;
      console.warn(
        '[notifications] Firebase Messaging is not installed yet. Run npm install and add Firebase native config files before testing push notifications.',
        error,
      );
    }
    return null;
  }
}

function getMessagingInstance(): {
  authorizationStatus: MessagingModule['AuthorizationStatus'];
  instance: MessagingInstance;
} | null {
  const messagingModule = getMessagingModule();
  if (!messagingModule) {
    return null;
  }

  return {
    authorizationStatus: messagingModule.AuthorizationStatus,
    instance: messagingModule.default(),
  };
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
}

function getLocale() {
  return Intl.DateTimeFormat().resolvedOptions().locale ?? 'en';
}

async function requestAndroidNotificationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const permissionResult = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return permissionResult === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestIosNotificationPermission(
  messaging: MessagingInstance,
  authorizationStatus?: MessagingModule['AuthorizationStatus'],
) {
  if (!messaging.requestPermission) {
    return true;
  }

  const permissionStatus = await messaging.requestPermission();
  const isAuthorized =
    permissionStatus === authorizationStatus?.AUTHORIZED ||
    permissionStatus === authorizationStatus?.PROVISIONAL;

  return Boolean(isAuthorized);
}

async function requestNotificationPermission(
  messaging: MessagingInstance,
  authorizationStatus?: MessagingModule['AuthorizationStatus'],
) {
  if (Platform.OS === 'ios') {
    return requestIosNotificationPermission(messaging, authorizationStatus);
  }

  return requestAndroidNotificationPermission();
}

async function upsertPushDevice(user: AppUser, pushToken: string) {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from('push_devices').upsert(
    {
      user_id: user.id,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      push_provider: 'fcm',
      push_token: pushToken,
      timezone: getTimezone(),
      locale: getLocale(),
      notifications_enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'push_token' },
  );

  if (error) {
    throw error;
  }
}

export async function syncPushNotificationsForUser(user: AppUser) {
  const messagingContext = getMessagingInstance();
  if (!messagingContext) {
    return undefined;
  }

  const { authorizationStatus, instance } = messagingContext;
  const isGranted = await requestNotificationPermission(instance, authorizationStatus);
  if (!isGranted) {
    if (__DEV__) {
      console.warn('[notifications] Notification permission was not granted.');
    }
    return undefined;
  }

  if (instance.registerDeviceForRemoteMessages) {
    await instance.registerDeviceForRemoteMessages();
  }

  const token = await instance.getToken();
  if (!token) {
    if (__DEV__) {
      console.warn('[notifications] Firebase Messaging did not return a device token.');
    }
    return undefined;
  }

  await upsertPushDevice(user, token);

  return instance.onTokenRefresh(nextToken => upsertPushDevice(user, nextToken));
}

export function registerPushBackgroundHandler() {
  const messagingContext = getMessagingInstance();
  messagingContext?.instance.setBackgroundMessageHandler?.(async () => {
    // Background messages are intentionally handled server-side for now.
  });
}
