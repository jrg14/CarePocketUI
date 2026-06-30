import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../ui-button/ui-button';

@Component({
  selector: 'app-ui-hero',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  templateUrl: './ui-hero.html'
})
export class UIHeroComponent {
  // Datos que recibe el componente
  @Input() title: string = 'Título principal';
  @Input() description: string = 'Aquí va una descripción persuasiva para el usuario.';
  @Input() imageSrc: string = 'assets/placeholder.png';
  @Input() primaryBtnText: string = 'Texto botón primario';
  @Input() secondaryBtnText: string = 'Texto botón secundario';

  // Eventos que emite hacia el componente padre
  @Output() onPrimaryAction = new EventEmitter<void>();
  @Output() onSecondaryAction = new EventEmitter<void>();

  // Métodos que disparan los eventos
  handlePrimary() {
    this.onPrimaryAction.emit();
  }

  handleSecondary() {
    this.onSecondaryAction.emit();
  }
}