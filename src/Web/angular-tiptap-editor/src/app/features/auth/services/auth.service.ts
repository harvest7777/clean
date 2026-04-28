import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { apiUsersLoginPost } from '../../../core/api/fn/users/api-users-login-post';
import { apiUsersRegisterPost } from '../../../core/api/fn/users/api-users-register-post';
import { apiUsersManageInfoGet } from '../../../core/api/fn/users/api-users-manage-info-get';
import { logout } from '../../../core/api/fn/users/logout';
import { InfoResponse } from '../../../core/api/models/info-response';

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly config = inject(ApiConfiguration);

  private readonly _currentUser = signal<InfoResponse | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      await firstValueFrom(
        apiUsersLoginPost(this.http, this.config.rootUrl, {
          useCookies: true,
          body: { email, password },
        })
      );
      await this.loadCurrentUser();
      return { success: true };
    } catch (e) {
      return { success: false, error: this.extractError(e) };
    }
  }

  async register(email: string, password: string): Promise<AuthResult> {
    try {
      await firstValueFrom(
        apiUsersRegisterPost(this.http, this.config.rootUrl, {
          body: { email, password },
        })
      );
      return { success: true };
    } catch (e) {
      return { success: false, error: this.extractError(e) };
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        logout(this.http, this.config.rootUrl, { body: {} })
      );
    } finally {
      this._currentUser.set(null);
      this.router.navigate(['/auth/login']);
    }
  }

  async loadCurrentUser(): Promise<void> {
    try {
      const response = await firstValueFrom(
        apiUsersManageInfoGet(this.http, this.config.rootUrl)
      );
      this._currentUser.set(response.body);
    } catch (e) {
      this._currentUser.set(null);
    }
  }

  private extractError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      return e.error?.detail ?? e.error?.title ?? e.message;
    }
    return 'An unexpected error occurred';
  }
}
