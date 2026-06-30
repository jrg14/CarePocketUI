import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.html'
})
export class UiButtonComponent {
  // Configuración de estilo
  @Input() variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' = 'primary';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  
  // Estados
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() onClick = new EventEmitter<void>();

  // Mapa de clases para limpiar el HTML
  get btnClasses(): string {
    return `btn btn-${this.variant} btn-${this.size} ${this.loading ? 'btn-disabled' : ''}`;
  }
}