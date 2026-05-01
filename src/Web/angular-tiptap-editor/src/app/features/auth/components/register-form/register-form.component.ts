import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppRouteUrls } from '../../../../core/routing/app-routes';

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent {
  protected readonly routes = AppRouteUrls;
  readonly isLoading = input(false);
  readonly isSuccess = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly submitted = output<{ email: string; password: string }>();

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}
