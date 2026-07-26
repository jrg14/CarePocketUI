import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [],
  templateUrl: './ui-modal.html',
})
export class UiModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() description = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  get modalBoxClasses(): string {
    const classes = ['modal-box', 'w-11/12'];

    const sizeClasses: Record<typeof this.size, string> = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };

    classes.push(sizeClasses[this.size]);

    return classes.join(' ');
  }

  close(): void {
    this.closed.emit();
  }

  closeFromBackdrop(): void {
    if (!this.closeOnBackdrop) {
      return;
    }

    this.close();
  }
}
