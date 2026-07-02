import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.html'
})
export class UiButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'link' = 'primary';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() shape: 'default' | 'circle' | 'square' = 'default';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() wide = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() onClick = new EventEmitter<void>();

  get btnClasses(): string {
    const classes = ['btn', `btn-${this.variant}`, `btn-${this.size}`];

    if (this.shape === 'circle') {
      classes.push('btn-circle');
    }

    if (this.shape === 'square') {
      classes.push('btn-square');
    }

    if (this.wide) {
      classes.push('btn-wide');
    }

    if (this.fullWidth) {
      classes.push('w-full');
    }

    if (this.loading || this.disabled) {
      classes.push('btn-disabled');
    }

    return classes.join(' ');
  }

  handleClick(): void {
    if (this.disabled || this.loading) {
      return;
    }

    this.onClick.emit();
  }
}
