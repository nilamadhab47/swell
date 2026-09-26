import fs from 'node:fs';
import path from 'node:path';
import { ExpoConfig, ConfigContext } from 'expo/config';

const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ||
  (fs.existsSync(path.resolve(__dirname, 'google-services.json'))
    ? './google-services.json'
    : undefined);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Swell',
  slug: 'swell',
  version: '1.0.2',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'swell',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0e141b',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.swell.quit',
    usesAppleSignIn: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#0e141b',
    },
    package: 'com.swell.quit',
    versionCode: 3,
    permissions: ['POST_NOTIFICATIONS', 'VIBRATE'],
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  plugins: [
    'expo-router',
    'expo-apple-authentication',
    'expo-web-browser',
    'expo-notifications',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ??
      'https://paisahipaisahoga-production.up.railway.app',
    // Required for Expo push tokens. Set EAS_PROJECT_ID (from `eas init`).
    eas: {
      projectId:
        process.env.EAS_PROJECT_ID ?? '4fa0b695-ecd1-44e8-816e-9d9369b89b89',
    },
  },
});
