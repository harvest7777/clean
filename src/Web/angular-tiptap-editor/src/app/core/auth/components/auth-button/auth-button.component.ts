import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-auth-button',
  templateUrl: './auth-button.component.html',
})
export class AuthButtonComponent {
  readonly label = input.required<string>();
  readonly isLoading = input(false);
  readonly pressed = output<void>();

  onClick(): void {
    this.pressed.emit();
  }
}
