import { create } from 'zustand';
import {
  getGoogleAuthUrl,
  loginAppleIdToken,
  loginEmail,
  logoutRemote,
  deleteAccountRemote,
  registerEmail,
  requestPhoneOtp,
  resendEmailOtp,
  setAuthLifecycleHandlers,
  setAuthToken,
  setRefreshToken,
  verifyEmailOtp,
  verifyPhoneOtp,
} from '../data/api';
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from '../data/tokenStore';
import type { AuthTokens, AuthUser } from '../data/types';
import { toE164Phone } from './phone';

interface AuthStore {
  hydrated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  hydrate: () => Promise<void>;
  applyTokens: (tokens: AuthTokens) => Promise<void>;
  requestPhoneCode: (appId: string, phone: string) => Promise<string>;
  verifyPhoneCode: (appId: string, phone: string, code: string) => Promise<void>;
  loginWithGoogle: (appId: string) => Promise<void>;
  loginWithApple: (appId: string) => Promise<void>;
  login: (appId: string, email: string, password: string) => Promise<void>;
  register: (
    appId: string,
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  verifyOtp: (appId: string, email: string, code: string) => Promise<void>;
  resendOtp: (appId: string, email: string) => Promise<void>;
  logout: (appId: string) => Promise<void>;
  deleteAccount: (appId: string) => Promise<void>;
}

function applyInMemory(tokens: AuthTokens) {
  setAuthToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken || null);
}

function assertTokens(tokens: AuthTokens, fallbackUser: AuthUser): AuthTokens {
  if (!tokens.accessToken) {
    throw new Error('That sign-in did not create a session. Try again.');
  }
  return {
    ...tokens,
    user: tokens.user ?? fallbackUser,
  };
}

export const useAuthStore = create<AuthStore>((set, get) => {
  setAuthLifecycleHandlers({
    onTokensRefreshed: async (tokens) => {
      await get().applyTokens(tokens);
    },
    onAuthInvalid: async () => {
      setAuthToken(null);
      setRefreshToken(null);
      await clearStoredSession();
      set({ accessToken: null, user: null });
    },
  });

  return {
    hydrated: false,
    accessToken: null,
    user: null,

    hydrate: async () => {
      const stored = await loadStoredSession();
      if (stored.accessToken) {
        setAuthToken(stored.accessToken);
        setRefreshToken(stored.refreshToken);
        set({
          hydrated: true,
          accessToken: stored.accessToken,
          user: stored.user,
        });
        return;
      }
      set({ hydrated: true, accessToken: null, user: null });
    },

    applyTokens: async (tokens) => {
      applyInMemory(tokens);
      const user = tokens.user ?? get().user;
      await saveStoredSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      });
      set({ accessToken: tokens.accessToken, user });
    },

    requestPhoneCode: async (appId, phone) => {
      const e164 = toE164Phone(phone);
      await requestPhoneOtp(appId, { phone: e164 });
      return e164;
    },

    verifyPhoneCode: async (appId, phone, code) => {
      const e164 = toE164Phone(phone);
      const tokens = await verifyPhoneOtp(appId, { phone: e164, code });
      await get().applyTokens(
        assertTokens(tokens, { id: '', phone: e164 })
      );
    },

    loginWithGoogle: async (appId) => {
      const WebBrowser = await import('expo-web-browser');
      const Linking = await import('expo-linking');
      WebBrowser.maybeCompleteAuthSession();
      const redirect = Linking.createURL('auth');
      const { url } = await getGoogleAuthUrl(appId, redirect);
      const result = await WebBrowser.openAuthSessionAsync(url, redirect);
      if (result.type !== 'success' || !('url' in result) || !result.url) {
        throw new Error('Google sign-in was cancelled.');
      }
      const parsed = Linking.parse(result.url);
      const accessToken = String(parsed.queryParams?.accessToken ?? '');
      const refreshToken = String(parsed.queryParams?.refreshToken ?? '');
      if (!accessToken) {
        throw new Error('Google sign-in did not return a session.');
      }
      await get().applyTokens({
        accessToken,
        refreshToken,
        user: { id: '' },
      });
    },

    loginWithApple: async (appId) => {
      const AppleAuthentication = await import('expo-apple-authentication');
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('Sign in with Apple is not available on this device.');
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple did not return a token.');
      }
      const tokens = await loginAppleIdToken(appId, credential.identityToken);
      await get().applyTokens(
        assertTokens(tokens, {
          id: '',
          email: credential.email ?? undefined,
          name: credential.fullName
            ? [credential.fullName.givenName, credential.fullName.familyName]
                .filter(Boolean)
                .join(' ')
            : undefined,
        })
      );
    },

    login: async (appId, email, password) => {
      const tokens = await loginEmail(appId, { email, password });
      if (!tokens.accessToken) {
        throw new Error('Verify your email first. We can send a code.');
      }
      await get().applyTokens({
        ...tokens,
        user: tokens.user ?? { id: '', email },
      });
    },

    register: async (appId, email, password, name) => {
      await registerEmail(appId, { email, password, name });
    },

    verifyOtp: async (appId, email, code) => {
      const tokens = await verifyEmailOtp(appId, { email, code });
      if (!tokens.accessToken) {
        throw new Error('That code did not create a session. Try again.');
      }
      await get().applyTokens({
        ...tokens,
        user: tokens.user ?? { id: '', email },
      });
    },

    resendOtp: async (appId, email) => {
      await resendEmailOtp(appId, { email });
    },

    logout: async (appId) => {
      await logoutRemote(appId);
      setAuthToken(null);
      setRefreshToken(null);
      await clearStoredSession();
      set({ accessToken: null, user: null });
    },

    deleteAccount: async (appId) => {
      await deleteAccountRemote(appId);
      setAuthToken(null);
      setRefreshToken(null);
      await clearStoredSession();
      set({ accessToken: null, user: null });
    },
  };
});
