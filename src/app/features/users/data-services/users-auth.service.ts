import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, firstValueFrom, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { usersApiEndpoints } from './users-api-endpoints';
import {
  ApiUserResponse,
  AuthCredentials,
  AuthUser,
  LoginResponse,
  RegisterPayload,
} from '../models/auth.models';

const STORAGE_KEY = 'carepocket.auth.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly readySignal = signal(false);
  private readonly busySignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly token = computed(() => this.tokenSignal());
  readonly user = computed(() => this.userSignal());
  readonly isReady = computed(() => this.readySignal());
  readonly isBusy = computed(() => this.busySignal());
  readonly error = computed(() => this.errorSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  async initialize(): Promise<void> {
    const storedToken = this.readStoredToken();

    if (!storedToken) {
      this.clearSession();
      this.readySignal.set(true);
      return;
    }

    this.tokenSignal.set(storedToken);

    try {
      const user = await firstValueFrom(this.getCurrentUser());
      this.userSignal.set(user);
    } catch {
      this.clearSession();
    } finally {
      this.readySignal.set(true);
    }
  }

  login(credentials: AuthCredentials): Observable<AuthUser> {
    this.busySignal.set(true);
    this.errorSignal.set(null);

    const body = new HttpParams()
      .set('username', credentials.email)
      .set('password', credentials.password);

    return this.http
      .post<LoginResponse>(this.apiUrl(usersApiEndpoints.login), body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        tap((response) => this.saveToken(response.access_token)),
        switchMap(() => this.getCurrentUser()),
        tap((user) => this.userSignal.set(user)),
        catchError((error: unknown) => {
          this.clearSession();
          this.errorSignal.set(this.getErrorMessage(error, 'No se ha podido iniciar sesión.'));
          return throwError(() => error);
        }),
        finalize(() => this.busySignal.set(false)),
      );
  }

  register(payload: RegisterPayload): Observable<AuthUser> {
    this.busySignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<ApiUserResponse>(this.apiUrl(usersApiEndpoints.register), {
        full_name: payload.fullName,
        email: payload.email,
        password: payload.password,
      })
      .pipe(
        switchMap((response) => of(this.mapUser(response))),
        catchError((error: unknown) => {
          this.errorSignal.set(this.getErrorMessage(error, 'No se ha podido crear la cuenta.'));
          return throwError(() => error);
        }),
        finalize(() => this.busySignal.set(false)),
      );
  }

  logout(): Observable<void> {
    this.busySignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<void>(this.apiUrl(usersApiEndpoints.logout), {}).pipe(
      catchError(() => of(void 0)),
      tap(() => this.clearSession()),
      finalize(() => this.busySignal.set(false)),
    );
  }

  private getCurrentUser(): Observable<AuthUser> {
    return this.http
      .get<ApiUserResponse>(this.apiUrl(usersApiEndpoints.me))
      .pipe(switchMap((response) => of(this.mapUser(response))));
  }

  private apiUrl(path: string): string {
    return `${environment.apiBaseUrl.replace(/\/$/, '')}${path}`;
  }

  private mapUser(response: ApiUserResponse): AuthUser {
    return {
      id: response.id,
      fullName: response.full_name,
      email: response.email,
      isActive: response.is_active,
      isSuperuser: response.is_superuser,
      isVerified: response.is_verified,
    };
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;

      if (Array.isArray(detail)) {
        const messages = detail
          .map((entry: unknown) => {
            if (entry && typeof entry === 'object') {
              const candidate = entry as { msg?: unknown; message?: unknown };
              return typeof candidate.msg === 'string'
                ? candidate.msg
                : typeof candidate.message === 'string'
                  ? candidate.message
                  : '';
            }

            return '';
          })
          .filter(Boolean);

        if (messages.length) {
          return messages.join(' ');
        }
      }

      if (typeof detail === 'string') {
        return detail;
      }

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }
    }

    return fallback;
  }

  private readStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(STORAGE_KEY);
  }

  private saveToken(token: string): void {
    this.tokenSignal.set(token);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, token);
    }
  }

  private clearSession(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
}
