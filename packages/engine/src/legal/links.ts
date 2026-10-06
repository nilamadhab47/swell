import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  PLAY_MARKET_URL,
  PLAY_STORE_URL,
} from './urls';

export {
  PLAY_MARKET_URL,
  PLAY_STORE_URL,
  PRIVACY_URL,
  TERMS_URL,
} from './urls';

export async function openLegalPage(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url).catch(() => undefined);
  }
}

export async function openPlayListing(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const can = await Linking.canOpenURL(PLAY_MARKET_URL);
      if (can) {
        await Linking.openURL(PLAY_MARKET_URL);
        return;
      }
    } catch {
      // Fall through to the https listing.
    }
  }
  await Linking.openURL(PLAY_STORE_URL).catch(() => undefined);
}
