import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface UINavLink {
  label: string;
  href: string;
  external?: boolean;
}

@Component({
  selector: 'app-ui-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-navbar.html',
})
export class UINavbarComponent {
  @Input() brand = '';
  @Input() brandHref = '/';
  @Input() links: ReadonlyArray<UINavLink> = [];
  @Input() ctaLabel = '';
  @Input() ctaHref = '';
  @Input() ctaExternal = false;
  @Input() sticky = true;
}
