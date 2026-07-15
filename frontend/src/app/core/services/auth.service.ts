import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError, of } from 'rxjs';
import { TokenService } from './token.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly authUrl = `${environment.apiBaseUrl}/auth`;
    private currentUser = signal<User | null>(null);

    user = this.currentUser.asReadonly();
    isLoggedIn = computed(() => !!this.currentUser());
    isAdmin = computed(() => this.currentUser()?.role === 'admin');

    constructor(
        private http: HttpClient,
        private tokenService: TokenService,
        private router: Router,
    ) { }

    register(name: string, email: string, password: string, role?: string) {
        return this.http.post<{ success: boolean; data: { user: User; accessToken: string } }>(
            `${this.authUrl}/register`, { name, email, password, role }
        ).pipe(tap(res => this.handleAuthSuccess(res.data)));
    }

    login(email: string, password: string) {
        return this.http.post<{ success: boolean; data: { user: User; accessToken: string } }>(
            `${this.authUrl}/login`, { email, password }
        ).pipe(tap(res => this.handleAuthSuccess(res.data)));
    }

    logout() {
        return this.http.post(`${this.authUrl}/logout`, {}).pipe(
            tap(() => {
                this.tokenService.clearToken();
                this.currentUser.set(null);
                this.router.navigate(['/login']);
            }),
            catchError((err) => {
                // Even if server logout fails/token expired, clear client session
                this.tokenService.clearToken();
                this.currentUser.set(null);
                this.router.navigate(['/login']);
                return of(null);
            })
        );
    }

    // Called once on app init to silently restore session via refresh cookie
    tryRestoreSession() {
        return this.http.post<{ success: boolean; data: { accessToken: string } }>(`${this.authUrl}/refresh`, {}).pipe(
            tap(res => this.tokenService.setToken(res.data.accessToken)),
            switchMap(() => this.http.get<{ success: boolean; data: User }>(`${environment.apiBaseUrl}/users/me`)),
            tap(res => this.currentUser.set(res.data)),
            catchError(() => {
                this.tokenService.clearToken();
                this.currentUser.set(null);
                return of(null);
            }), // not logged in — fail silently
        );
    }

    updateProfile(name: string, phone?: string, addresses?: any[]) {
        return this.http.put<{ success: boolean; data: User }>(`${environment.apiBaseUrl}/users/me`, { name, phone, addresses }).pipe(
            tap(res => this.currentUser.set(res.data))
        );
    }

    private handleAuthSuccess(data: { user: User; accessToken: string }) {
        this.tokenService.setToken(data.accessToken);
        this.currentUser.set(data.user);
    }
}
