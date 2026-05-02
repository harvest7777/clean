import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppRouteUrls } from '../../../routing/app-routes';
import { ButtonComponent } from '../../../../ui/components/button/button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-button-container',
  imports: [ButtonComponent],
  template: `
    <button appButton [isLoading]="isLoading()" (click)="onPress()">
      {{ label() }}
    </button>
  `,
})
export class AuthButtonContainerComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);

  constructor() {
    void this.loadAuthState();
  }

  readonly label = () => this.isAuthenticated() ? 'Logout' : 'Login';

  async onPress(): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    if (!this.isAuthenticated()) {
      await this.router.navigateByUrl(AppRouteUrls.authLogin);
      return;
    }

    this.isLoading.set(true);

    try {
      await this.auth.logout();
      this.isAuthenticated.set(false);
      await this.router.navigateByUrl(AppRouteUrls.home);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadAuthState(): Promise<void> {
    const status = await this.auth.getAuthStatus();
    this.isAuthenticated.set(status.kind === 'authenticated');
  }
}
