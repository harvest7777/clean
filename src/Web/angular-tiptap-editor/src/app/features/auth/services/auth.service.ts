import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { apiUsersLoginPost } from '../../../core/api/fn/users/api-users-login-post';
import { apiUsersRegisterPost } from '../../../core/api/fn/users/api-users-register-post';
import { apiUsersManageInfoGet } from '../../../core/api/fn/users/api-users-manage-info-get';
import { logout } from '../../../core/api/fn/users/logout';
import { InfoResponse } from '../../../core/api/models/info-response';
import { OperationState } from '../types/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);

  private readonly _currentUser = signal<InfoResponse | null>(null);
  private readonly _loginState = signal<OperationState>({ status: 'idle' });
  private readonly _registerState = signal<OperationState>({ status: 'idle' });
  private readonly _logoutState = signal<OperationState>({ status: 'idle' });

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly loginState = this._loginState.asReadonly();
  readonly registerState = this._registerState.asReadonly();
  readonly logoutState = this._logoutState.asReadonly();

  resetLoginState(): void {
    this._loginState.set({ status: 'idle' });
  }

  resetRegisterState(): void {
    this._registerState.set({ status: 'idle' });
  }

  async login(email: string, password: string): Promise<void> {
    this._loginState.set({ status: 'loading' });

    try {
      await firstValueFrom(
        apiUsersLoginPost(this.http, this.config.rootUrl, {
          useCookies: true,
          body: { email, password },
        })
      );
    } catch (e) {
      this._loginState.set({ status: 'error', message: this.extractError(e) });
      return;
    }

    // Login succeeded — load user separately so a profile failure doesn't
    // look like a credential error.
    try {
      await this.loadCurrentUser();
      this._loginState.set({ status: 'success' });
    } catch {
      this._loginState.set({
        status: 'error',
        message: 'Signed in but failed to load your profile. Please refresh.',
      });
    }
  }

  async register(email: string, password: string): Promise<void> {
    this._registerState.set({ status: 'loading' });
    try {
      await firstValueFrom(
        apiUsersRegisterPost(this.http, this.config.rootUrl, {
          body: { email, password },
        })
      );
      this._registerState.set({ status: 'success' });
    } catch (e) {
      this._registerState.set({ status: 'error', message: this.extractError(e) });
    }
  }

  async logout(): Promise<void> {
    this._logoutState.set({ status: 'loading' });
    try {
      await firstValueFrom(
        logout(this.http, this.config.rootUrl, { body: {} })
      );
      this._currentUser.set(null);
      this._logoutState.set({ status: 'success' });
    } catch (e) {
      this._logoutState.set({ status: 'error', message: this.extractError(e) });
    }
  }

  async loadCurrentUser(): Promise<void> {
    try {
      const response = await firstValueFrom(
        apiUsersManageInfoGet(this.http, this.config.rootUrl)
      );
      if (response.body) {
        this._currentUser.set(response.body);
      }
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        this._currentUser.set(null);
        return;
      }
      throw e;
    }
  }

  private extractError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      return e.error?.detail ?? e.error?.title ?? 'An unexpected error occurred';
    }
    return 'An unexpected error occurred';
  }
}
