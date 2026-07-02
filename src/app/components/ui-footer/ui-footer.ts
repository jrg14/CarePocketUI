import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface UIFooterLink {
  label: string;
  href: string;
  external?: boolean;
}

@Component({
  selector: 'app-ui-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-footer.html',
})
export class UIFooterComponent {
  @Input() brand = 'CarePocket';
  @Input() description = 'Componentes daisyUI para mantener una estética uniforme en toda la app.';
  @Input() links: ReadonlyArray<UIFooterLink> = [];
  @Input() socialLinks: ReadonlyArray<UIFooterLink> = [];
  @Input() currentYear = new Date().getFullYear();
}
