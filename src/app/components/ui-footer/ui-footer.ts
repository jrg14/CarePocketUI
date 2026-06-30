import { Component } from '@angular/core';

@Component({
  selector: 'app-ui-footer',
  standalone: true,
  templateUrl: './ui-footer.html'
})
export class UIFooterComponent {
  // Obtenemos el año automáticamente para que siempre esté actualizado
  currentYear: number = new Date().getFullYear();
}