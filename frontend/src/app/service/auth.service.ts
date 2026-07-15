import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../environments/environment";
import {
  AuthResponse,
  AuthUser,
  RefreshResponse,
} from "../interface/api.models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;
  private accessToken: string | null = null;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  setSession(user: AuthUser, accessToken: string): void {
    this.currentUserSubject.next(user);
    this.accessToken = accessToken;
  }

  clearSession(): void {
    this.currentUserSubject.next(null);
    this.accessToken = null;
  }

  getAuthHeaders(): HttpHeaders {
    return this.accessToken
      ? new HttpHeaders({ Authorization: `Bearer ${this.accessToken}` })
      : new HttpHeaders();
  }

  getAuthOptions() {
    return {
      withCredentials: true,
      headers: this.getAuthHeaders(),
    };
  }

  register(payload: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, payload, {
      withCredentials: true,
    });
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload, {
      withCredentials: true,
    });
  }

  logout() {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.authUrl}/logout`,
      {},
      { withCredentials: true },
    );
  }

  refresh() {
    return this.http.post<RefreshResponse>(
      `${this.authUrl}/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  getMe() {
    return this.http.get<{ success: boolean; data: AuthUser }>(
      `${environment.apiBaseUrl}/users/me`,
      this.getAuthOptions(),
    );
  }
}
