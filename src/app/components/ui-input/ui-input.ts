import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-input.html',
})
export class UiInputComponent {
  private static nextId = 0;

  @Input() label = '';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search' = 'text';
  @Input() value: string | number = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() inputId = `ui-input-${UiInputComponent.nextId++}`;
  @Input() autocomplete = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() fullWidth = true;

  @Output() valueChange = new EventEmitter<any>();

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    if (this.type === 'number') {
      const nextValue = target.value === '' ? 0 : Number(target.value);
      this.valueChange.emit(Number.isNaN(nextValue) ? 0 : nextValue);
      return;
    }

    this.valueChange.emit(target.value);
  }
}
