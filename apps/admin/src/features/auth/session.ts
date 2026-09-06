const ACCESS_TOKEN_KEY = 'wantere.admin.accessToken';
const REFRESH_TOKEN_KEY = 'wantere.admin.refreshToken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const session = {
  read(): AuthTokens | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },

  write(tokens: AuthTokens): void {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clear(): void {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
