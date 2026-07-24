import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { UIFooterComponent } from './components/ui-footer/ui-footer';
import { UINavbarComponent } from './components/ui-navbar/ui-navbar';
import { Router } from '@angular/router';
import { AuthService } from './features/users/data-services/users-auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UINavbarComponent, UIFooterComponent],
  templateUrl: './app.html',
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly publicNavLinks = [
  ];

  private readonly authenticatedNavLinks = [
  ];

  readonly navLinks = computed(() =>
    this.authService.isAuthenticated() ? this.authenticatedNavLinks : this.publicNavLinks,
  );

  readonly footerLinks = [
  ];

  readonly socialLinks = [
    { label: 'GitHub', href: 'https://github.com', external: true },
  ];

  readonly authUser = this.authService.user;
  readonly authBusy = this.authService.isBusy;
  readonly showFooter = computed(() => !this.authService.isAuthenticated());
  readonly brandHref = computed(() => (this.authService.isAuthenticated() ? '/dashboard' : '/'));

  readonly loginCtaLabel = computed(() =>
    this.authService.isAuthenticated() ? '' : 'Iniciar sesión',
  );
  readonly loginCtaHref = computed(() => (this.authService.isAuthenticated() ? '/dashboard' : '/auth/login'));
  readonly secondaryCtaLabel = computed(() => (this.authService.isAuthenticated() ? '' : 'Crear cuenta'));
  readonly secondaryCtaHref = computed(() => (this.authService.isAuthenticated() ? '' : '/auth/register'));

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        void this.router.navigate(['/auth/login']);
      },
    });
  }
}
