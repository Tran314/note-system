const ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_STORAGE_KEY = 'auth-storage';

type PersistedAuthState = {
  state?: {
    accessToken?: string | null;
  };
};

const readPersistedAccessToken = (): string | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedAuthState;
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

export const getStoredAccessToken = (): string | null => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      return token;
    }
  } catch {
    return null;
  }

  return readPersistedAccessToken();
};

export const setStoredAccessToken = (accessToken: string | null) => {
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {}
};

