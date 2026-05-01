import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppRouteUrls } from '../../../../core/routing/app-routes';

@Component({
  selector: 'app-already-authenticated-page',
  imports: [RouterLink],
  templateUrl: './already-authenticated.page.html',
})
export class AlreadyAuthenticatedPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly routes = AppRouteUrls;
  readonly isLoggingOut = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onLogout(): Promise<void> {
    this.isLoggingOut.set(true);
    this.errorMessage.set(null);

    try {
      await this.auth.logout();
      await this.router.navigateByUrl(this.routes.authLogin);
    } catch {
      this.errorMessage.set('Unable to sign out right now. Please try again.');
    } finally {
      this.isLoggingOut.set(false);
    }
  }
}
