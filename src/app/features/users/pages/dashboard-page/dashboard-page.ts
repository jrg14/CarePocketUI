import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { UiBadgeComponent } from '../../../../components/ui-badge/ui-badge';
import { UiButtonComponent } from '../../../../components/ui-button/ui-button';
import { UiCardComponent } from '../../../../components/ui-card/ui-card';
import { AuthService } from '../../data-services/users-auth.service';
import { LedgerSummaryService } from '../../data-services/ledger-summary.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, UiBadgeComponent, UiButtonComponent, UiCardComponent],
  templateUrl: './dashboard-page.html',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly ledgerSummaryService = inject(LedgerSummaryService);
  private readonly router = inject(Router);

  private readonly amountFormatter = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private readonly percentFormatter = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  private readonly dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  private readonly dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  readonly user = this.authService.user;
  readonly authBusy = this.authService.isBusy;
  readonly summary = this.ledgerSummaryService.summary;
  readonly loading = this.ledgerSummaryService.loading;
  readonly error = this.ledgerSummaryService.error;
  readonly selectedPeriodDays = signal(30);

  readonly periodOptions = [
    { days: 7, label: '7 días' },
    { days: 30, label: '30 días' },
    { days: 90, label: '90 días' },
  ] as const;

  readonly welcomeTitle = computed(() => {
    const user = this.user();

    return user ? `Bienvenido, ${user.fullName}` : 'Resumen general de tus cuentas';
  });

  readonly welcomeDescription = computed(() =>
    this.user()
      ? 'Aquí tienes el estado financiero del periodo elegido: saldo, flujo, cuentas destacadas, alertas y recomendaciones.'
      : 'Estamos recuperando tu contexto financiero para mostrar el resumen general de tus cuentas.',
  );

  readonly heroBadges = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return [] as { label: string; variant: 'neutral' | 'primary' | 'success' | 'warning' | 'info' }[];
    }

    return [
      { label: `${summary.overview.activeAccountsCount} cuentas activas`, variant: 'success' as const },
      { label: `${summary.overview.transactionsCount} movimientos`, variant: 'info' as const },
      {
        label: summary.overview.lastTransactionAt
          ? `Último movimiento ${this.formatDateTime(summary.overview.lastTransactionAt)}`
          : 'Sin movimientos recientes',
        variant: 'neutral' as const,
      },
    ];
  });

  readonly overviewStats = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return [];
    }

    return [
      {
        title: 'Saldo total',
        value: this.formatMoney(summary.overview.totalBalance),
        description: `${summary.overview.activeAccountsCount} cuentas activas`,
        valueClass: 'text-primary',
      },
      {
        title: 'Ingresos',
        value: this.formatMoney(summary.overview.incomeTotal),
        description: `Media diaria ${this.formatMoney(summary.overview.averageDailyIncome)}`,
        valueClass: 'text-success',
      },
      {
        title: 'Gastos',
        value: this.formatMoney(summary.overview.expenseTotal),
        description: `Media diaria ${this.formatMoney(summary.overview.averageDailyExpense)}`,
        valueClass: 'text-error',
      },
      {
        title: 'Flujo neto',
        value: this.formatSignedMoney(summary.overview.netFlow),
        description: `${summary.overview.transactionsCount} movimientos en el periodo`,
        valueClass: summary.overview.netFlow >= 0 ? 'text-success' : 'text-error',
      },
    ];
  });

  readonly topAccounts = computed(() => {
    const accounts = this.summary()?.topAccounts ?? [];
    const maxBalance = Math.max(...accounts.map((account) => Math.abs(account.balance)), 0);

    return accounts.slice(0, 5).map((account) => ({
      ...account,
      balanceLabel: this.formatMoney(account.balance),
      progress: maxBalance > 0 ? (Math.abs(account.balance) / maxBalance) * 100 : 0,
      valueClass: account.balance >= 0 ? 'text-success' : 'text-error',
    }));
  });

  readonly expenseCategories = computed(() => this.mapCategories(this.summary()?.expensesByCategory ?? []));
  readonly incomeCategories = computed(() => this.mapCategories(this.summary()?.incomeByCategory ?? []));
  readonly alerts = computed(() => this.summary()?.alerts ?? []);
  readonly recommendations = computed(() => this.summary()?.recommendations ?? []);

  readonly periodLabel = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return 'Cargando periodo...';
    }

    return `Periodo de ${summary.period.days} días · ${this.formatDate(summary.period.start)} - ${this.formatDate(summary.period.end)}`;
  });

  readonly comparisonLabel = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return 'Comparando periodos...';
    }

    return `Comparado con ${this.formatDate(summary.period.previousStart)} - ${this.formatDate(summary.period.previousEnd)}`;
  });

  constructor() {
    effect(() => {
      const periodDays = this.selectedPeriodDays();
      this.loadSummary(periodDays);
    });
  }

  selectPeriod(periodDays: number): void {
    if (this.selectedPeriodDays() === periodDays) {
      return;
    }

    this.selectedPeriodDays.set(periodDays);
  }

  refresh(): void {
    this.loadSummary(this.selectedPeriodDays());
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        void this.router.navigate(['/auth/login']);
      },
    });
  }

  formatMoney(value: number): string {
    return `${value < 0 ? '-' : ''}€${this.amountFormatter.format(Math.abs(value))}`;
  }

  formatSignedMoney(value: number): string {
    if (value === 0) {
      return this.formatMoney(value);
    }

    return `${value > 0 ? '+' : '-'}€${this.amountFormatter.format(Math.abs(value))}`;
  }

  formatSignedPercent(value: number): string {
    if (!Number.isFinite(value) || value === 0) {
      return '0.0%';
    }

    return `${value > 0 ? '+' : '-'}${this.percentFormatter.format(Math.abs(value))}%`;
  }

  formatDate(value: Date): string {
    return this.dateFormatter.format(value);
  }

  formatDateTime(value: Date): string {
    return this.dateTimeFormatter.format(value);
  }

  private loadSummary(periodDays: number): void {
    this.ledgerSummaryService.loadSummary(periodDays).subscribe({
      error: () => void 0,
    });
  }

  private mapCategories(
    categories: { categoryId: number | null; categoryName: string; amount: number; transactionCount: number }[],
  ): Array<
    {
      categoryId: number | null;
      categoryName: string;
      amount: number;
      transactionCount: number;
    } & {
      amountLabel: string;
      progress: number;
    }
  > {
    const total = categories.reduce((sum, category) => sum + Math.max(category.amount, 0), 0);

    return categories.slice(0, 5).map((category) => ({
      ...category,
      amountLabel: this.formatMoney(category.amount),
      progress: total > 0 ? (Math.max(category.amount, 0) / total) * 100 : 0,
    }));
  }
}
