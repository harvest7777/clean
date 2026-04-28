import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>Create account</h1>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (success()) {
        <p class="success">Account created! <a routerLink="/auth/login">Sign in</a></p>
      } @else {
        <form (ngSubmit)="onSubmit()">
          <label>
            Email
            <input type="email" [(ngModel)]="email" name="email" required />
          </label>
          <label>
            Password
            <input type="password" [(ngModel)]="password" name="password" required />
          </label>
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
      }
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const result = await this.auth.register(this.email, this.password);

    this.loading.set(false);

    if (result.success) {
      this.success.set(true);
    } else {
      this.error.set(result.error);
    }
  }
}
