import { Component, computed, input } from '@angular/core';
import { TerminalSpinnerComponent } from '../terminal-spinner/terminal-spinner.component';

@Component({
  selector: 'button[appButton]',
  standalone: true,
  imports: [TerminalSpinnerComponent],
  host: {
    'class': 'py-2 px-3 outline outline-2 outline-black outline-offset-0 border-0 rounded-none bg-transparent',
    '[disabled]': '_effectiveDisabled()',
  },
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
