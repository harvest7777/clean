import { Component, input, output } from '@angular/core';
import { TerminalSpinnerComponent } from '../terminal-spinner/terminal-spinner.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [TerminalSpinnerComponent],
  styles: [`
    button {
      padding: 0.5rem 0.75rem;
      outline: 2px solid black;
      outline-offset: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }
  `],
  template: `
    <button [type]="type()" [disabled]="isLoading() || disabled()" (click)="pressed.emit()">
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
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly isLoading = input(false);
  readonly disabled = input(false);
  readonly pressed = output<void>();
}
