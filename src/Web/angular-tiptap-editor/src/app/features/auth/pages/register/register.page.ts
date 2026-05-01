import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';

@Component({
  selector: 'app-register-page',
  imports: [RegisterFormComponent],
  templateUrl: './register.page.html',
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);

  readonly isLoading = signal(false);
  readonly isSuccess = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onSubmit(credentials: { email: string; password: string }): Promise<void> {
    this.isLoading.set(true);
    this.isSuccess.set(false);
    this.errorMessage.set(null);

    try {
      await this.auth.register(credentials.email, credentials.password);
      this.isSuccess.set(true);
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
