import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex items-center gap-2 outline outline-2 outline-brand py-2 px-3 focus-within:outline-4 focus-within:[&>span]:opacity-100">
      <span class="select-none opacity-40 transition-opacity duration-150">></span>
      <input
        class="flex-1 bg-transparent outline-none placeholder:opacity-30"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="_value"
        [disabled]="_disabled"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly type = input('text');
  readonly placeholder = input('type here...');

  protected _value = '';
  protected _disabled = false;

  private onChange = (_: string) => {};
  protected onTouched = () => {};

  writeValue(value: string): void {
    this._value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this._value = value;
    this.onChange(value);
  }
}
