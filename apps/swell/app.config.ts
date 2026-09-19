import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Swell',
  slug: 'swell',
  version: '1.0.0',
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
    permissions: ['POST_NOTIFICATIONS', 'VIBRATE'],
    ...(process.env.GOOGLE_SERVICES_JSON
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON }
      : {}),
  },
  plugins: [
    'expo-router',
    'expo-apple-authentication',
    'expo-web-browser',
    'expo-notifications',
    [
      'expo-av',
      {
        microphonePermission:
          'Swell uses the mic so you can record a short note about what triggered a craving.',
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
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
