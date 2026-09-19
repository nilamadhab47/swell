import type {
  ApiResponse,
  AuthTokens,
  CravingList,
  CravingPayload,
  CravingStats,
  Dashboard,
  Profile,
  ProfileUpdate,
} from './types';
import { ApiError } from './types';
import { extractAuthTokens, extractId, normalizeCravingList, normalizeDashboard, normalizeProfile } from './normalize';

let authToken: string | null = null;
let refreshToken: string | null = null;
let apiBaseUrl = 'http://localhost:3000';
let defaultAppId = 'swell';
const API_PREFIX = '/api/v1';

type RefreshHandler = (tokens: AuthTokens) => Promise<void>;
type LogoutHandler = () => Promise<void>;

let onTokensRefreshed: RefreshHandler | null = null;
let onAuthInvalid: LogoutHandler | null = null;

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url.replace(/\/$/, '');
}

export function setDefaultAppId(appId: string) {
  defaultAppId = appId;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthLifecycleHandlers(handlers: {
  onTokensRefreshed?: RefreshHandler;
  onAuthInvalid?: LogoutHandler;
}) {
  onTokensRefreshed = handlers.onTokensRefreshed ?? null;
  onAuthInvalid = handlers.onAuthInvalid ?? null;
}

function productHeaders(appId: string): Record<string, string> {
  return { 'x-product-id': appId };
}

function withAppId(path: string, appId: string): string {
  if (path.includes('app_id=')) return path;
  const join = path.includes('?') ? '&' : '?';
  return `${path}${join}app_id=${encodeURIComponent(appId)}`;
}

async function parseBody(res: Response): Promise<ApiResponse<unknown> | { error?: string }> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    return { error: text };
  }
}

async function rawRequest(
  path: string,
  appId: string,
  options: RequestInit = {},
  token: string | null
): Promise<{ res: Response; body: ApiResponse<unknown> | { error?: string } }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...productHeaders(appId),
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBaseUrl}${API_PREFIX}${path}`, {
    ...options,
    headers,
  });
  const body = await parseBody(res);
  return { res, body };
}

function fail(res: Response, body: ApiResponse<unknown> | { error?: string }): never {
  const message =
    ('message' in body && body.message) ||
    (body as { error?: string }).error ||
    res.statusText;
  const code =
    'error' in body && body.error && typeof body.error === 'object'
      ? body.error.code
      : undefined;
  throw new ApiError(message || `API ${res.status}`, res.status, code);
}

async function tryRefresh(appId: string): Promise<boolean> {
  if (!refreshToken) return false;
  const { res, body } = await rawRequest(
    '/authentication/refresh',
    appId,
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    },
    null
  );
  if (!res.ok || ('success' in body && body.success === false)) {
    return false;
  }
  const data = 'data' in body ? body.data : body;
  const tokens = extractAuthTokens(data);
  if (!tokens.accessToken) return false;
  authToken = tokens.accessToken;
  if (tokens.refreshToken) refreshToken = tokens.refreshToken;
  if (onTokensRefreshed) {
    await onTokensRefreshed({
      ...tokens,
      refreshToken: tokens.refreshToken || refreshToken || '',
    });
  }
  return true;
}

async function request<T>(
  path: string,
  appId: string,
  options: RequestInit = {},
  opts?: { auth?: boolean; skipRefresh?: boolean }
): Promise<T> {
  const needsAuth = opts?.auth !== false;
  const { res, body } = await rawRequest(
    path,
    appId,
    options,
    needsAuth ? authToken : null
  );

  if (res.status === 401 && needsAuth && !opts?.skipRefresh) {
    const refreshed = await tryRefresh(appId);
    if (refreshed) {
      return request<T>(path, appId, options, { ...opts, skipRefresh: true });
    }
    if (onAuthInvalid) await onAuthInvalid();
    fail(res, body);
  }

  if (!res.ok) fail(res, body);

  if ('success' in body && body.success === false) {
    fail(res, body);
  }

  if ('data' in body) {
    return body.data as T;
  }
  return body as T;
}

export async function registerEmail(
  appId: string,
  payload: { email: string; password: string; name?: string }
): Promise<unknown> {
  return request(
    '/authentication/email/register',
    appId,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: false }
  );
}

export async function verifyEmailOtp(
  appId: string,
  payload: { email: string; code: string }
): Promise<AuthTokens> {
  const data = await request<unknown>(
    '/authentication/email/otp/verify',
    appId,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: false }
  );
  return extractAuthTokens(data);
}

export async function resendEmailOtp(
  appId: string,
  payload: { email: string }
): Promise<unknown> {
  return request(
    '/authentication/email/otp/resend',
    appId,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: false }
  );
}

export async function loginEmail(
  appId: string,
  payload: { email: string; password: string }
): Promise<AuthTokens> {
  const data = await request<unknown>(
    '/authentication/email/login',
    appId,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: false }
  );
  return extractAuthTokens(data);
}

export async function logoutRemote(appId: string): Promise<void> {
  if (!refreshToken) return;
  try {
    await request(
      '/authentication/logout',
      appId,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      { auth: false, skipRefresh: true }
    );
  } catch {
    // Local sign-out still proceeds.
  }
}

export async function deleteAccountRemote(appId: string): Promise<void> {
  await request('/authentication/me', appId, { method: 'DELETE' }, {
    skipRefresh: true,
  });
}

export async function getMe(appId: string): Promise<unknown> {
  return request('/authentication/me', appId);
}

export async function requestPhoneOtp(
  appId: string,
  payload: { phone: string }
): Promise<unknown> {
  return request(
    '/authentication/phone/otp/request',
    appId,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: false }
  );
}

export async function verifyPhoneOtp(
  appId: string,
  payload: { phone: string; code: string }
): Promise<AuthTokens> {
  const data = await request<unknown>(
    '/authentication/phone/otp/verify',
    appId,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: false }
  );
  return extractAuthTokens(data);
}

export async function getGoogleAuthUrl(
  appId: string,
  appRedirect: string
): Promise<{ url: string }> {
  const params = new URLSearchParams({
    product: appId,
    app_redirect: appRedirect,
  });
  const data = await request<unknown>(
    `/authentication/google?${params.toString()}`,
    appId,
    {},
    { auth: false }
  );
  const root =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const url = typeof root.url === 'string' ? root.url : '';
  if (!url) {
    throw new Error('Google sign-in is not available right now.');
  }
  return { url };
}

export async function loginGoogleIdToken(
  appId: string,
  idToken: string
): Promise<AuthTokens> {
  const data = await request<unknown>(
    '/authentication/google',
    appId,
    { method: 'POST', body: JSON.stringify({ idToken }) },
    { auth: false }
  );
  return extractAuthTokens(data);
}

export async function loginAppleIdToken(
  appId: string,
  idToken: string
): Promise<AuthTokens> {
  const data = await request<unknown>(
    '/authentication/apple',
    appId,
    { method: 'POST', body: JSON.stringify({ idToken }) },
    { auth: false }
  );
  return extractAuthTokens(data);
}

export async function postCraving(
  appId: string,
  payload: CravingPayload
): Promise<{ id: string }> {
  const data = await request<unknown>(
    withAppId('/cravings', appId),
    appId,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return { id: extractId(data) };
}

export async function patchCraving(
  appId: string,
  id: string,
  payload: Partial<CravingPayload>
): Promise<{ id: string }> {
  const data = await request<unknown>(`/cravings/${id}`, appId, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return { id: extractId(data) || id };
}

export async function getCravingStats(appId: string): Promise<CravingStats> {
  const data = await request<unknown>(
    withAppId('/cravings/stats', appId),
    appId
  );
  return normalizeDashboard({ cravings: data }).cravings;
}

export async function getCravings(
  appId: string,
  opts?: { limit?: number; offset?: number }
): Promise<CravingList> {
  const params = new URLSearchParams({ app_id: appId });
  if (opts?.limit != null) params.set('limit', String(opts.limit));
  if (opts?.offset != null) params.set('offset', String(opts.offset));
  const data = await request<unknown>(`/cravings?${params.toString()}`, appId);
  return normalizeCravingList(data);
}

export async function getDashboard(appId: string): Promise<Dashboard> {
  const data = await request<unknown>(
    withAppId('/dashboard', appId),
    appId
  );
  return normalizeDashboard(data);
}

export async function getProfile(appId: string): Promise<Profile> {
  const data = await request<unknown>('/quitx/profile/me', appId);
  return normalizeProfile(data);
}

export async function updateProfile(
  appId: string,
  payload: ProfileUpdate
): Promise<Profile> {
  const data = await request<unknown>('/quitx/profile/me', appId, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeProfile(data);
}

export async function createProfile(
  appId: string,
  payload: ProfileUpdate
): Promise<Profile> {
  const data = await request<unknown>('/quitx/profile', appId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeProfile(data);
}

export async function registerPushToken(
  appId: string,
  payload: { token: string; platform?: string; timezone?: string }
): Promise<unknown> {
  return request('/push/register', appId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function unregisterPushToken(
  appId: string,
  token: string
): Promise<unknown> {
  return request('/push/unregister', appId, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export { defaultAppId };
