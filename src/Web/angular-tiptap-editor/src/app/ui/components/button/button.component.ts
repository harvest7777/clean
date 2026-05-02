import { Component, computed, input } from '@angular/core';
import { TerminalSpinnerComponent } from '../terminal-spinner/terminal-spinner.component';

@Component({
  selector: 'button[appButton]',
  standalone: true,
  imports: [TerminalSpinnerComponent],
  host: {
    '[disabled]': '_effectiveDisabled()',
  },
  styles: [`
    :host {
      padding: 0.5rem 0.75rem;
      outline: 2px solid black;
      outline-offset: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }
  `],
  template: `
    @if (isLoading()) {
      <app-terminal-spinner />
    } @else {
      <ng-content />
    }
  `,
})
export class ButtonComponent {
  readonly isLoading = input(false);
  readonly disabled = input(false);

  protected readonly _effectiveDisabled = computed(() => this.isLoading() || this.disabled());
}
