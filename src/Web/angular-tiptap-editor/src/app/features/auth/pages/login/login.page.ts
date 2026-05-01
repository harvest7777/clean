import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>Sign in</h1>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <form (ngSubmit)="onSubmit()">
        <label>
          Email
          <input type="email" [(ngModel)]="email" name="email" required />
        </label>
        <label>
          Password
          <input type="password" [(ngModel)]="password" name="password" required />
        </label>
        <button type="submit" [disabled]="isLoading()">
          {{ isLoading() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
    </div>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  readonly isLoading = computed(() => this.auth.loginState().status === 'loading');
  readonly errorMessage = computed(() => {
    const s = this.auth.loginState();
    return s.status === 'error' ? s.message : null;
  });

  constructor() {
    this.auth.resetLoginState();

    effect(() => {
      if (this.auth.loginState().status === 'success') {
        this.router.navigate(['/editor']);
      }
    });
  }

  onSubmit(): void {
    this.auth.login(this.email, this.password);
  }
}
