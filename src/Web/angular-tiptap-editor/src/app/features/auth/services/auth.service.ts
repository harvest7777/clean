import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { apiUsersLoginPost } from '../../../core/api/fn/users/api-users-login-post';
import { apiUsersRegisterPost } from '../../../core/api/fn/users/api-users-register-post';
import { apiUsersManageInfoGet } from '../../../core/api/fn/users/api-users-manage-info-get';
import { logout } from '../../../core/api/fn/users/logout';

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

  async checkAuth(): Promise<boolean> {
    try {
      await firstValueFrom(
        apiUsersManageInfoGet(this.http, this.config.rootUrl)
      );
      return true;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        return false;
      }

      throw e;
    }
  }
}
