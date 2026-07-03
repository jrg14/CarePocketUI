import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { UiBadgeComponent } from '../../../../components/ui-badge/ui-badge';
import { UiButtonComponent } from '../../../../components/ui-button/ui-button';
import { UiCardComponent } from '../../../../components/ui-card/ui-card';
import { AuthService } from '../../data-services/users-auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, UiBadgeComponent, UiButtonComponent, UiCardComponent],
  templateUrl: './dashboard-page.html',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly loading = this.authService.isBusy;

  readonly quickActions = [
    {
      title: 'Movimientos',
      description: 'Revisar ingresos, gastos y picos de consumo.',
      href: '#movimientos',
    },
    {
      title: 'Presupuestos',
      description: 'Controlar límites y detectar desviaciones.',
      href: '#presupuestos',
    },
    {
      title: 'Objetivos',
      description: 'Seguir metas y ahorro mes a mes.',
      href: '#objetivos',
    },
    {
      title: 'Ajustes',
      description: 'Gestionar perfil, alertas y preferencias.',
      href: '#ajustes',
    },
  ];

  readonly featureSections = [
    {
      id: 'movimientos',
      badge: 'Análisis',
      title: 'Movimientos',
      description: 'Conecta tus transacciones para entender dónde se va el dinero y qué hábitos se repiten.',
      highlights: ['Agrupa gastos por categoría', 'Detecta picos inusuales', 'Explica patrones repetidos'],
    },
    {
      id: 'presupuestos',
      badge: 'Control',
      title: 'Presupuestos',
      description: 'Define límites de gasto y mira cómo se desvían tus números antes de que sea tarde.',
      highlights: ['Límites por categoría', 'Alertas de desviación', 'Seguimiento visual del mes'],
    },
    {
      id: 'objetivos',
      badge: 'Planificación',
      title: 'Objetivos',
      description: 'Convierte ahorro y deuda en metas claras con seguimiento sencillo desde el dashboard.',
      highlights: ['Metas de ahorro', 'Reducción de deuda', 'Progreso visible por objetivo'],
    },
    {
      id: 'ajustes',
      badge: 'Cuenta',
      title: 'Ajustes',
      description: 'Gestiona tu sesión, preferencias y futuras integraciones desde un solo lugar.',
      highlights: ['Perfil de usuario', 'Preferencias de alertas', 'Conexión con servicios futuros'],
    },
  ];

  readonly welcomeTitle = computed(() => {
    const user = this.user();

    return user ? `Bienvenido, ${user.fullName}` : 'Bienvenido a tu espacio privado';
  });

  readonly welcomeDescription = computed(() =>
    this.user()
      ? 'Tu sesión está activa. Desde aquí puedes seguir el análisis, revisar recomendaciones y volver al simulador.'
      : 'La sesión está activa, pero todavía estamos recuperando tu perfil.',
  );

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        void this.router.navigate(['/auth/login']);
      },
    });
  }
}
