declare module 'expo-web-browser' {
  export function maybeCompleteAuthSession(): { type: string };
  export function openAuthSessionAsync(
    url: string,
    redirectUrl?: string
  ): Promise<{ type: 'success' | 'cancel' | 'dismiss' | 'locked'; url?: string }>;
}

declare module 'expo-apple-authentication' {
  export enum AppleAuthenticationScope {
    FULL_NAME = 0,
    EMAIL = 1,
  }
  export function isAvailableAsync(): Promise<boolean>;
  export function signInAsync(options: {
    requestedScopes?: AppleAuthenticationScope[];
  }): Promise<{
    identityToken: string | null;
    email: string | null;
    fullName: {
      givenName: string | null;
      familyName: string | null;
    } | null;
  }>;
}

declare module 'expo-linking' {
  export function createURL(path: string): string;
  export function parse(url: string): {
    queryParams?: Record<string, string | undefined>;
  };
}
