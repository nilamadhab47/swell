const ACCESS_KEY = 'swell.accessToken';
const REFRESH_KEY = 'swell.refreshToken';
const USER_KEY = 'swell.authUser';

type StoredUser = { id: string; email?: string; phone?: string; name?: string };

const memory: Record<string, string> = {};

async function secure(): Promise<typeof import('expo-secure-store') | null> {
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

async function read(key: string): Promise<string | null> {
  const store = await secure();
  if (!store) return memory[key] ?? null;
  try {
    return (await store.getItemAsync(key)) ?? memory[key] ?? null;
  } catch {
    return memory[key] ?? null;
  }
}

async function write(key: string, value: string | null): Promise<void> {
  if (value === null) {
    delete memory[key];
  } else {
    memory[key] = value;
  }
  const store = await secure();
  if (!store) return;
  try {
    if (value === null) {
      await store.deleteItemAsync(key);
    } else {
      await store.setItemAsync(key, value);
    }
  } catch {
    // Web / missing native module — memory is enough for the session.
  }
}

export async function loadStoredSession(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  user: StoredUser | null;
}> {
  const [accessToken, refreshToken, userJson] = await Promise.all([
    read(ACCESS_KEY),
    read(REFRESH_KEY),
    read(USER_KEY),
  ]);
  let user: StoredUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson) as StoredUser;
    } catch {
      user = null;
    }
  }
  return { accessToken, refreshToken, user };
}

export async function saveStoredSession(session: {
  accessToken: string;
  refreshToken: string;
  user: StoredUser | null;
}): Promise<void> {
  await Promise.all([
    write(ACCESS_KEY, session.accessToken),
    write(REFRESH_KEY, session.refreshToken),
    write(USER_KEY, session.user ? JSON.stringify(session.user) : null),
  ]);
}

export async function clearStoredSession(): Promise<void> {
  await Promise.all([
    write(ACCESS_KEY, null),
    write(REFRESH_KEY, null),
    write(USER_KEY, null),
  ]);
}
