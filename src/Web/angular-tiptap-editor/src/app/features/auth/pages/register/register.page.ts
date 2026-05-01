import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>Create account</h1>

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      @if (isSuccess()) {
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
          <button type="submit" [disabled]="isLoading()">
            {{ isLoading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
      }
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);

  email = '';
  password = '';

  readonly isLoading = computed(() => this.auth.registerState().status === 'loading');
  readonly isSuccess = computed(() => this.auth.registerState().status === 'success');
  readonly errorMessage = computed(() => {
    const s = this.auth.registerState();
    return s.status === 'error' ? s.message : null;
  });

  constructor() {
    this.auth.resetRegisterState();
  }

  onSubmit(): void {
    this.auth.register(this.email, this.password);
  }
}
