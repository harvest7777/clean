import { Component, input, output } from '@angular/core';
import { TerminalSpinnerComponent } from '../terminal-spinner/terminal-spinner.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [TerminalSpinnerComponent],
  template: `
    <button type="button" [disabled]="isLoading()" (click)="pressed.emit()">
      @if (isLoading()) {
        <app-terminal-spinner />
      } @else {
        {{ label() }}
      }
    </button>
  `,
})
export class ButtonComponent {
  readonly label = input.required<string>();
  readonly isLoading = input(false);
  readonly pressed = output<void>();
}
