import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { apiUsersLoginPost } from '../../../core/api/fn/users/api-users-login-post';
import { apiUsersRegisterPost } from '../../../core/api/fn/users/api-users-register-post';
import { apiUsersManageInfoGet } from '../../../core/api/fn/users/api-users-manage-info-get';
import { logout } from '../../../core/api/fn/users/logout';

export type AuthStatus =
  | { kind: 'authenticated' }
  | { kind: 'unauthenticated' }
  | { kind: 'unavailable'; statusCode?: number; message?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(
      apiUsersLoginPost(this.http, this.config.rootUrl, {
        useCookies: true,
        body: { email, password },
      })
    );
  }

  async register(email: string, password: string): Promise<void> {
    await firstValueFrom(
      apiUsersRegisterPost(this.http, this.config.rootUrl, {
        body: { email, password },
      })
    );
  }

  async logout(): Promise<void> {
    await firstValueFrom(logout(this.http, this.config.rootUrl, { body: {} }));
  }

  async getAuthStatus(): Promise<AuthStatus> {
    try {
      await firstValueFrom(
        apiUsersManageInfoGet(this.http, this.config.rootUrl)
      );
      return { kind: 'authenticated' };
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        if (e.status === 401) {
          return { kind: 'unauthenticated' };
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
