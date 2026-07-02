import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { UIFooterComponent } from './components/ui-footer/ui-footer';
import { UINavbarComponent } from './components/ui-navbar/ui-navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UINavbarComponent, UIFooterComponent],
  templateUrl: './app.html',
})
export class AppComponent {
  readonly navLinks = [
    { label: 'Problema', href: '#problema' },
    { label: 'Análisis', href: '#analisis' },
    { label: 'Simulación', href: '#simulacion' },
  ];

  readonly footerLinks = [
    { label: 'Problema', href: '#problema' },
    { label: 'Análisis', href: '#analisis' },
    { label: 'Simulación', href: '#simulacion' },
  ];

  readonly socialLinks = [
    { label: 'GitHub', href: 'https://github.com', external: true },
  ];
}
