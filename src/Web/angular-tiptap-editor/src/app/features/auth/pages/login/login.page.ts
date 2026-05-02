import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppRouteUrls } from '../../../../core/routing/app-routes';
import { AuthService } from '../../services/auth.service';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  imports: [LoginFormComponent],
  templateUrl: './login.page.html',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly routes = AppRouteUrls;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onSubmit(credentials: { email: string; password: string }): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.auth.login(credentials.email, credentials.password);

      const status = await this.auth.getAuthStatus();
      if (status.kind !== 'authenticated') {
        this.errorMessage.set(
          status.kind === 'unavailable'
            ? status.message ?? 'We could not verify your session right now.'
            : 'Signed in but your session could not be verified. Please try again.'
        );
        return;
      }

      await this.router.navigateByUrl(this.routes.editor);
    } catch (e) {
      this.errorMessage.set(this.getErrorMessage(e));
    } finally {
      this.isLoading.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.detail ?? error.error?.title ?? 'An unexpected error occurred';
    }

    return 'An unexpected error occurred';
  }
}
