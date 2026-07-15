import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgApexchartsModule, type ApexOptions } from 'ng-apexcharts';

import { UiBadgeComponent } from '../../../../components/ui-badge/ui-badge';
import { UiButtonComponent } from '../../../../components/ui-button/ui-button';
import { UiCardComponent } from '../../../../components/ui-card/ui-card';
import { AuthService } from '../../data-services/users-auth.service';
import { LedgerSummaryService } from '../../data-services/ledger-summary.service';

type DashboardCategoryViewModel = {
  categoryId: number | null;
  categoryName: string;
  amount: number;
  amountLabel: string;
  progress: number;
};

type DashboardAccountViewModel = {
  accountId: number;
  accountName: string;
  balance: number;
  income: number;
  expense: number;
  balanceLabel: string;
  incomeLabel: string;
  expenseLabel: string;
  valueClass: string;
  progress: number;
  expensesByCategory: DashboardCategoryViewModel[];
};

type DashboardQuickAction = {
  label: string;
  variant: 'primary' | 'secondary' | 'accent';
  kind: 'create-account' | 'create-transaction';
};

type BalanceChartOptions = {
  chart: NonNullable<ApexOptions['chart']>;
  series: NonNullable<ApexOptions['series']>;
  labels: NonNullable<ApexOptions['labels']>;
  colors: NonNullable<ApexOptions['colors']>;
  stroke: NonNullable<ApexOptions['stroke']>;
  dataLabels: NonNullable<ApexOptions['dataLabels']>;
  legend: NonNullable<ApexOptions['legend']>;
  plotOptions: NonNullable<ApexOptions['plotOptions']>;
  tooltip: NonNullable<ApexOptions['tooltip']>;
  responsive: NonNullable<ApexOptions['responsive']>;
};

type ExpenseChartOptions = {
  chart: NonNullable<ApexOptions['chart']>;
  series: NonNullable<ApexOptions['series']>;
  colors: NonNullable<ApexOptions['colors']>;
  plotOptions: NonNullable<ApexOptions['plotOptions']>;
  dataLabels: NonNullable<ApexOptions['dataLabels']>;
  xaxis: NonNullable<ApexOptions['xaxis']>;
  yaxis: NonNullable<ApexOptions['yaxis']>;
  grid: NonNullable<ApexOptions['grid']>;
  tooltip: NonNullable<ApexOptions['tooltip']>;
  legend: NonNullable<ApexOptions['legend']>;
  responsive: NonNullable<ApexOptions['responsive']>;
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, UiBadgeComponent, UiButtonComponent, UiCardComponent],
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
      ? 'Aquí tienes el estado financiero actual: saldo total, ingresos, gastos y el detalle por cuentas.'
      : 'Estamos recuperando tu contexto financiero para mostrar el resumen general.',
  );

  readonly heroBadges = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return [] as { label: string; variant: 'neutral' | 'primary' | 'success' | 'warning' | 'info' }[];
    }

    return [
      { label: `${summary.accounts.length} cuentas`, variant: 'success' as const },
      { label: `Saldo ${this.formatMoney(summary.totals.balance)}`, variant: 'primary' as const },
      { label: `Gasto ${this.formatMoney(summary.totals.expense)}`, variant: 'info' as const },
    ];
  });

  readonly expenseCategories = computed(() => this.mapCategories(this.summary()?.totals.expensesByCategory ?? []));

  readonly accounts = computed<DashboardAccountViewModel[]>(() => {
    const accounts = this.summary()?.accounts ?? [];
    const maxBalance = Math.max(...accounts.map((account) => Math.abs(account.balance)), 0);

    return accounts.map((account) => ({
      ...account,
      balanceLabel: this.formatMoney(account.balance),
      incomeLabel: this.formatMoney(account.income),
      expenseLabel: this.formatMoney(account.expense),
      progress: maxBalance > 0 ? (Math.abs(account.balance) / maxBalance) * 100 : 0,
      valueClass: account.balance >= 0 ? 'text-success' : 'text-error',
      expensesByCategory: this.mapCategories(account.expensesByCategory),
    }));
  });

  readonly featuredAccounts = computed(() => this.accounts().slice(0, 2));

  readonly balanceChartOptions = computed<BalanceChartOptions>(() => {
    const summary = this.summary();
    const income = summary?.totals.income ?? 0;
    const expense = summary?.totals.expense ?? 0;

    return {
      chart: {
        type: 'donut',
        height: 320,
        toolbar: { show: false },
        sparkline: { enabled: true },
      },
      series: [Math.max(income, 0), Math.max(expense, 0)],
      labels: ['Ingresos', 'Gastos'],
      colors: ['#22c55e', '#ef4444'],
      stroke: {
        width: 4,
        colors: ['transparent'],
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => this.formatMoney(value),
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 280,
            },
          },
        },
      ],
    };
  });

  readonly expenseChartOptions = computed<ExpenseChartOptions>(() => {
    const categories = this.expenseCategories();

    return {
      chart: {
        type: 'bar',
        height: 240,
        toolbar: { show: false },
        sparkline: { enabled: false },
      },
      series: [
        {
          name: 'Gasto',
          data: categories.map((category) => Number(category.amount.toFixed(2))),
        },
      ],
      colors: ['#ef4444'],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '62%',
          distributed: true,
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: categories.map((category) => category.categoryName),
        labels: {
          formatter: (value: string) => this.formatMoney(Number(value)),
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#4b5563',
            fontSize: '12px',
          },
        },
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
      },
      tooltip: {
        y: {
          formatter: (value: number) => this.formatMoney(value),
        },
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 220,
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

    const account = this.featuredAccounts()[0];

    if (!account) {
      this.createTransactionFeedback.set('No hay una cuenta disponible para crear la transacción.');
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
      .createTransaction(account.accountId, {
        amount,
        currency: 'USD',
        transaction_type: normalizedType,
        transaction_date: new Date().toISOString(),
        description: description.trim() || 'string',
        transaction_category_id: transactionCategoryId,
      })
      .subscribe({
        next: () => {
          this.createTransactionFeedback.set(`Transacción creada en "${account.accountName}".`);
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

  private mapCategories(
    categories: { categoryId: number | null; categoryName: string; amount: number }[],
  ): DashboardCategoryViewModel[] {
    const total = categories.reduce((sum, category) => sum + Math.max(category.amount, 0), 0);

    return categories.slice(0, 5).map((category) => ({
      ...category,
      amountLabel: this.formatMoney(category.amount),
      progress: total > 0 ? (Math.max(category.amount, 0) / total) * 100 : 0,
    }));
  }
}
