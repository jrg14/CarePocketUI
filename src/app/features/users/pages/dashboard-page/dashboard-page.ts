import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgApexchartsModule, type ApexOptions } from 'ng-apexcharts';

import { UiBadgeComponent } from '../../../../components/ui-badge/ui-badge';
import { UiButtonComponent } from '../../../../components/ui-button/ui-button';
import { AuthService } from '../../data-services/users-auth.service';
import { LedgerSummaryService } from '../../data-services/ledger-summary.service';

type DashboardCategoryViewModel = {
  categoryId: number | null;
  categoryName: string;
  amount: number;
  amountLabel: string;
  progress: number;
};

type DashboardTransactionViewModel = {
  transactionId: number;
  amount: number;
  amountLabel: string;
  currency: string;
  transactionType: 'income' | 'expense';
  transactionDate: string;
  description: string;
  transactionCategoryId: number | null;
  typeLabel: string;
  typeClass: string;
};

type DashboardQuickAction = {
  label: string;
  variant: 'primary' | 'secondary' | 'accent';
  kind: 'create-account' | 'create-transaction';
};

type CategoryExpenseChartOptions = {
  chart: NonNullable<ApexOptions['chart']>;
  series: NonNullable<ApexOptions['series']>;
  colors: NonNullable<ApexOptions['colors']>;
  plotOptions: NonNullable<ApexOptions['plotOptions']>;
  dataLabels: NonNullable<ApexOptions['dataLabels']>;
  tooltip: NonNullable<ApexOptions['tooltip']>;
  labels: NonNullable<ApexOptions['labels']>;
  stroke: NonNullable<ApexOptions['stroke']>;
  legend: NonNullable<ApexOptions['legend']>;
  responsive: NonNullable<ApexOptions['responsive']>;
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, UiBadgeComponent, UiButtonComponent],
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

  readonly user = this.authService.user;
  readonly authBusy = this.authService.isBusy;
  readonly summary = this.ledgerSummaryService.summary;
  readonly loading = this.ledgerSummaryService.loading;
  readonly error = this.ledgerSummaryService.error;
  readonly createAccountBusy = signal(false);
  readonly createTransactionBusy = signal(false);
  readonly createAccountFeedback = signal<string | null>(null);
  readonly createTransactionFeedback = signal<string | null>(null);
  readonly quickActions: DashboardQuickAction[] = [
    { label: 'Crear cuenta', variant: 'primary', kind: 'create-account' },
    { label: 'Crear transacción', variant: 'secondary', kind: 'create-transaction' },
  ];

  readonly welcomeTitle = computed(() => {
    const user = this.user();

    return user ? `Bienvenido, ${user.fullName}` : 'Resumen general de tu dashboard';
  });

  readonly welcomeDescription = computed(() =>
    this.user()
      ? 'Aquí tienes el estado financiero actual: balance, salud mensual, categorías de gasto y movimientos recientes.'
      : 'Estamos recuperando tu contexto financiero para mostrar el resumen general.',
  );

  readonly heroBadges = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return [] as { label: string; variant: 'neutral' | 'primary' | 'success' | 'warning' | 'info' }[];
    }

    return [
      { label: `Saldo ${this.formatMoney(summary.balance)}`, variant: 'primary' as const },
      { label: `Salud ${this.formatPercent(summary.monthlyHealth)}`, variant: 'success' as const },
      { label: `${summary.topExpenseCategories.length} categorías top`, variant: 'info' as const },
    ];
  });

  readonly topExpenseCategories = computed<DashboardCategoryViewModel[]>(() => {
    const categories = this.summary()?.topExpenseCategories ?? [];
    const total = categories.reduce((sum, category) => sum + Math.max(category.amount, 0), 0);

    return categories.map((category) => ({
      ...category,
      amountLabel: this.formatMoney(category.amount),
      progress: total > 0 ? (Math.max(category.amount, 0) / total) * 100 : 0,
    }));
  });

  readonly latestTransactions = computed<DashboardTransactionViewModel[]>(() => {
    const transactions = this.summary()?.latestTransactions ?? [];

    return transactions.map((transaction) => ({
      ...transaction,
      amountLabel: this.formatMoney(transaction.amount),
      typeLabel: transaction.transactionType === 'income' ? 'Ingreso' : 'Gasto',
      typeClass: transaction.transactionType === 'income' ? 'text-success' : 'text-error',
    }));
  });

  readonly categoryExpenseChartOptions = computed<CategoryExpenseChartOptions>(() => {
    const categories = this.topExpenseCategories();

    return {
      chart: {
        type: 'donut',
        height: 280,
        toolbar: { show: false },
        sparkline: { enabled: true },
      },
      series: categories.map((category) => category.amount),
      colors: ['#2563eb', '#f97316', '#8b5cf6', '#10b981', '#14b8a6'],
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: (value: number) => this.formatMoney(value),
        },
      },
      labels: categories.map((category) => category.categoryName),
      stroke: {
        width: 4,
        colors: ['transparent'],
      },
      legend: {
        position: 'bottom',
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 260,
            },
          },
        },
      ],
    };
  });

  constructor() {
    effect(() => {
      this.loadSummary();
    });
  }

  refresh(): void {
    this.loadSummary();
  }

  handleQuickAction(action: DashboardQuickAction): void {
    if (action.kind === 'create-account') {
      this.createAccount();
      return;
    }

    if (action.kind === 'create-transaction') {
      this.createTransaction();
    }
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

  formatPercent(value: number): string {
    return `${this.amountFormatter.format(value)}%`;
  }

  firstName(fullName: string | null | undefined): string {
    if (!fullName) {
      return 'Alex';
    }

    return fullName.split(' ')[0] ?? 'Alex';
  }

  private loadSummary(): void {
    this.ledgerSummaryService.loadSummary().subscribe({
      error: () => void 0,
    });
  }

  private createAccount(): void {
    if (this.createAccountBusy()) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const accountName = window.prompt('Nombre de la cuenta');

    if (accountName === null) {
      return;
    }

    const normalizedName = accountName.trim();

    if (!normalizedName) {
      this.createAccountFeedback.set('Escribe un nombre para la cuenta.');
      return;
    }

    this.createAccountBusy.set(true);
    this.createAccountFeedback.set(null);

    this.ledgerSummaryService.createAccount(normalizedName).subscribe({
      next: () => {
        this.createAccountFeedback.set(`Cuenta "${normalizedName}" creada correctamente.`);
        this.refresh();
      },
      error: () => {
        this.createAccountFeedback.set('No se ha podido crear la cuenta.');
        this.createAccountBusy.set(false);
      },
      complete: () => {
        this.createAccountBusy.set(false);
      },
      });
  }

  private createTransaction(): void {
    if (this.createTransactionBusy()) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const accountIdInput = window.prompt('ID de la cuenta', '1');

    if (accountIdInput === null) {
      return;
    }

    const accountId = Number.parseInt(accountIdInput, 10);

    if (!Number.isInteger(accountId) || accountId <= 0) {
      this.createTransactionFeedback.set('El ID de la cuenta debe ser un número entero positivo.');
      return;
    }

    const amountInput = window.prompt('Importe de la transacción', '1');

    if (amountInput === null) {
      return;
    }

    const amount = Number(amountInput.replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      this.createTransactionFeedback.set('Introduce un importe válido mayor que cero.');
      return;
    }

    const description = window.prompt('Descripción de la transacción', 'string');

    if (description === null) {
      return;
    }

    const categoryInput = window.prompt('ID de categoría', '0');

    if (categoryInput === null) {
      return;
    }

    const transactionCategoryId = Number.parseInt(categoryInput, 10);

    if (!Number.isInteger(transactionCategoryId) || transactionCategoryId < 0) {
      this.createTransactionFeedback.set('El ID de categoría debe ser un número entero mayor o igual que cero.');
      return;
    }

    const transactionTypeInput = window.prompt('Tipo de transacción', 'expense');

    if (transactionTypeInput === null) {
      return;
    }

    const normalizedType = transactionTypeInput.trim().toLowerCase();

    if (normalizedType !== 'expense' && normalizedType !== 'income') {
      this.createTransactionFeedback.set('El tipo de transacción debe ser "expense" o "income".');
      return;
    }

    this.createTransactionBusy.set(true);
    this.createTransactionFeedback.set(null);

    this.ledgerSummaryService
      .createTransaction(accountId, {
        amount,
        currency: 'EUR',
        transaction_type: normalizedType,
        transaction_date: new Date().toISOString(),
        description: description.trim() || 'string',
        transaction_category_id: transactionCategoryId,
      })
      .subscribe({
        next: () => {
          this.createTransactionFeedback.set(`Transacción creada en la cuenta ${accountId}.`);
          this.refresh();
        },
        error: () => {
          this.createTransactionFeedback.set('No se ha podido crear la transacción.');
          this.createTransactionBusy.set(false);
        },
        complete: () => {
          this.createTransactionBusy.set(false);
        },
      });
  }

}
