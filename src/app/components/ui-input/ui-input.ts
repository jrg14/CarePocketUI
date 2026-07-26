import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type UiInputValue = string | number;

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
})
export class UiInputComponent implements ControlValueAccessor {
  private static nextId = 0;

  @Input() label = '';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search' | 'date' = 'text';
  @Input() value: UiInputValue = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() inputId = `ui-input-${UiInputComponent.nextId++}`;
  @Input() autocomplete = '';
  @Input() inputMode = '';
  @Input() inputClass = '';
  @Input() min: string | number | null = null;
  @Input() max: string | number | null = null;
  @Input() step: string | number | null = null;
  @Input() maxLength: number | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() fullWidth = true;

  @Output() valueChange = new EventEmitter<UiInputValue>();

  private onChange: (value: UiInputValue) => void = () => void 0;
  private onTouched: () => void = () => void 0;

  get inputClasses(): string {
    const classes = ['input', 'input-bordered'];

    if (this.fullWidth) {
      classes.push('w-full');
    }

    if (this.errorText) {
      classes.push('input-error');
    }

    if (this.inputClass) {
      classes.push(this.inputClass);
    }

    return classes.join(' ');
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const nextValue = this.normalizeValue(target.value);

    this.value = nextValue;
    this.valueChange.emit(nextValue);
    this.onChange(nextValue);
  }

  handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: UiInputValue | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: UiInputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  private normalizeValue(value: string): UiInputValue {
    if (this.type !== 'number') {
      return value;
    }

    const nextValue = value === '' ? 0 : Number(value);

    return Number.isNaN(nextValue) ? 0 : nextValue;
  }
}
