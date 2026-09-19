import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { registerPushToken } from '../data/api';

// Show notifications while the app is foregrounded too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // SDK 53 fields:
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function resolveProjectId(): string | undefined {
  const extra = Constants?.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  return (
    extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } })?.easConfig?.projectId
  );
}

/**
 * Registers this device for personalized push notifications.
 *
 * Best-effort and non-blocking: if permission is denied, the projectId is
 * missing, or we're in an environment without remote push (e.g. Expo Go on
 * some platforms / iOS Simulator), it silently no-ops without crashing.
 *
 * Call once the user is authenticated.
 */
export function usePushNotifications(params: { enabled: boolean; appId: string }) {
  const { enabled, appId } = params;
  const doneRef = useRef(false);

  useEffect(() => {
    if (!enabled || doneRef.current) return;
    doneRef.current = true;

    void (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Swell',
            importance: Notifications.AndroidImportance.DEFAULT,
            lightColor: '#F6A58E',
          });
        }

        type PermLike = { granted?: boolean; status?: string };
        const existing = (await Notifications.getPermissionsAsync()) as PermLike;
        let granted = existing.granted ?? existing.status === 'granted';
        if (!granted) {
          const requested =
            (await Notifications.requestPermissionsAsync()) as PermLike;
          granted = requested.granted ?? requested.status === 'granted';
        }
        if (!granted) {
          doneRef.current = false; // allow a retry next mount
          return;
        }

        const projectId = resolveProjectId();
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        const token = tokenResponse.data;
        if (!token) {
          doneRef.current = false;
          return;
        }

        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;

        await registerPushToken(appId, {
          token,
          platform: Platform.OS,
          timezone,
        });
      } catch {
        // Push is best-effort; never block the app on it.
        doneRef.current = false;
      }
    })();
  }, [enabled, appId]);
}
