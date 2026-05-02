import { Component, DestroyRef, inject, signal } from '@angular/core';

@Component({
  selector: 'app-terminal-spinner',
  standalone: true,
  template: `<span class="font-mono">{{ frame() }}</span>`,
})
export class TerminalSpinnerComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  protected readonly frame = signal(this.frames[0]);

  constructor() {
    let index = 0;
    const id = setInterval(() => {
      index = (index + 1) % this.frames.length;
      this.frame.set(this.frames[index]);
    }, 80);

    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
