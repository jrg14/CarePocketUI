import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-textarea.html',
})
export class UiTextareaComponent {
  private static nextId = 0;

  @Input() label = '';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() inputId = `ui-textarea-${UiTextareaComponent.nextId++}`;
  @Input() rows = 4;
  @Input() required = false;
  @Input() disabled = false;
  @Input() fullWidth = true;

  @Output() valueChange = new EventEmitter<string>();

  handleInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }
}
