import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiConfiguration } from '../../api/api-configuration';
import { apiUsersLoginPost } from '../../api/fn/users/api-users-login-post';
import { apiUsersRegisterPost } from '../../api/fn/users/api-users-register-post';
import { apiUsersManageInfoGet } from '../../api/fn/users/api-users-manage-info-get';
import { logout } from '../../api/fn/users/logout';

export type AuthStatus =
  | { kind: 'authenticated' }
  | { kind: 'unauthenticated' }
  | { kind: 'unavailable'; statusCode?: number; message?: string };

type CachedAuthStatus = Extract<AuthStatus, { kind: 'authenticated' | 'unauthenticated' }>;

@Injectable({ providedIn: 'root' })
/*
 * AuthService is the frontend boundary for authentication-related API calls.
 * It performs login, registration, logout, and session verification, and
 * translates backend or network failures into a small authentication status model.
 */
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);
  private cachedStatus: CachedAuthStatus | null = null;

  invalidateCache(): void {
    this.cachedStatus = null;
  }

  async login(email: string, password: string): Promise<void> {
    this.invalidateCache();

    await firstValueFrom(
      apiUsersLoginPost(this.http, this.config.rootUrl, {
        useCookies: true,
        body: { email, password },
      })
    );

    // The login endpoint returning 200 does not guarantee the browser accepted the auth cookie,
    // so verify the session before treating the user as authenticated in client state.
    const status = await this.getAuthStatus();
    if (status.kind !== 'authenticated') {
      throw new Error('Login completed but the session could not be established.');
    }
  }

  async register(email: string, password: string): Promise<void> {
    await firstValueFrom(
      apiUsersRegisterPost(this.http, this.config.rootUrl, {
        body: { email, password },
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(logout(this.http, this.config.rootUrl, { body: {} }));
    } catch (e) {
      console.error(e)
    } finally {
      this.cachedStatus = { kind: "unauthenticated" };
    }
  }

  async getAuthStatus(): Promise<AuthStatus> {
    if (this.cachedStatus) {
      return this.cachedStatus;
    }

    try {
      await firstValueFrom(
        apiUsersManageInfoGet(this.http, this.config.rootUrl)
      );
      this.cachedStatus = { kind: 'authenticated' };
      return this.cachedStatus;
    } catch (e) {
      console.error(e);
      if (e instanceof HttpErrorResponse) {
        if (e.status === 401) {
          this.cachedStatus = { kind: 'unauthenticated' };
          return this.cachedStatus;
        }

        return {
          kind: 'unavailable',
          statusCode: e.status || undefined,
          message: this.getUnavailableMessage(e),
        };
      }

      return {
        kind: 'unavailable',
        message: 'We could not verify your session right now.',
      };
    }
  }

  private getUnavailableMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The server could not be reached.';
    }

    if (error.status >= 500) {
      return 'The server is temporarily unavailable.';
    }

    if (error.status === 404) {
      return 'The authentication service is temporarily unavailable.';
    }

    return 'We could not verify your session right now.';
  }
}
