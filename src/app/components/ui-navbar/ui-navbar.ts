import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface UINavLink {
  label: string;
  href: string;
  external?: boolean;
  fragment?: string;
}

export interface UINavUser {
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-ui-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ui-navbar.html',
})
export class UINavbarComponent {
  @Input() brand = '';
  @Input() brandHref = '/';
  @Input() links: ReadonlyArray<UINavLink> = [];
  @Input() ctaLabel = '';
  @Input() ctaHref = '';
  @Input() secondaryCtaLabel = '';
  @Input() secondaryCtaHref = '';
  @Input() secondaryCtaExternal = false;
  @Input() ctaExternal = false;
  @Input() sticky = true;
  @Input() authUser: UINavUser | null = null;
  @Input() authBusy = false;
  @Input() dashboardHref = '/dashboard';
  @Input() loginHref = '/auth/login';
  @Input() registerHref = '/auth/register';

  @Output() logout = new EventEmitter<void>();

  get userInitials(): string {
    const fullName = this.authUser?.fullName?.trim() || '';
    const parts = fullName.split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');

    return initials.join('') || 'CP';
  }

  get showAuthActions(): boolean {
    return !!this.authUser;
  }
}
