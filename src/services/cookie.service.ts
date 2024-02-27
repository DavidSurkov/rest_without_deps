export enum CookieKey {
  JWT = 'JWT',
}

export class CookieService {
  public createCookie(key: CookieKey, value: string): string {
    return `${key}=${value}; Path=/; HttpOnly; SameSite=Strict`;
  }

  public retrieveCookieValue(
    cookieHeader: string,
    expectedKey: CookieKey,
  ): string | null {
    const list: Record<string, string> = {};
    cookieHeader?.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const key = parts.shift()?.trim();
      const lastEl = parts.pop()?.trim();
      if (!key || !lastEl) {
        return;
      }

      const value = decodeURIComponent(lastEl);
      list[key] = value;
    });
    return list[expectedKey] || null;
  }
}
