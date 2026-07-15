import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
    // Deliberately NOT localStorage — reduces XSS exposure.
    // Refresh token lives in an httpOnly cookie the browser manages.
    private accessToken = signal<string | null>(null);

    setToken(token: string) { this.accessToken.set(token); }
    getToken() { return this.accessToken(); }
    clearToken() { this.accessToken.set(null); }
}
