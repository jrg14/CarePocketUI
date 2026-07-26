import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgApexchartsModule, type ApexOptions } from 'ng-apexcharts';

import { UiBadgeComponent } from '../../../../components/ui-badge/ui-badge';
import { UiButtonComponent } from '../../../../components/ui-button/ui-button';
import { UiInputComponent } from '../../../../components/ui-input/ui-input';
import { UiModalComponent } from '../../../../components/ui-modal/ui-modal';
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

type DashboardModalKind = DashboardQuickAction['kind'];
type TransactionType = 'income' | 'expense';

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

type CategoryExpenseChartOptions = {
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    UiBadgeComponent,
    UiButtonComponent,
    UiInputComponent,
    UiModalComponent,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly ledgerSummaryService = inject(LedgerSummaryService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);

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
  readonly activeModal = signal<DashboardModalKind | null>(null);
  readonly quickActions: DashboardQuickAction[] = [
    { label: 'Crear cuenta', variant: 'primary', kind: 'create-account' },
    { label: 'Crear transacción', variant: 'secondary', kind: 'create-transaction' },
  ];

  readonly accountForm = this.formBuilder.group({
    accountName: ['', [Validators.required]],
  });

  readonly transactionForm = this.formBuilder.group({
    accountId: [0, [Validators.required, Validators.min(1)]],
    amount: [1, [Validators.required, Validators.min(0.01)]],
    currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    transactionType: ['expense' as TransactionType, [Validators.required]],
    transactionDate: [this.todayInputValue(), [Validators.required]],
    description: ['', [Validators.required]],
    transactionCategoryId: [0, [Validators.required, Validators.min(0)]],
  });

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

  readonly balanceChartOptions = computed<BalanceChartOptions>(() => {
    const accounts = this.accounts();
    const firstAccount = accounts[0];
    const secondAccount = accounts[1];
    const firstIncome = firstAccount?.income ?? 0;
    const firstExpense = firstAccount?.expense ?? 0;
    const secondIncome = secondAccount?.income ?? 0;
    const secondExpense = secondAccount?.expense ?? 0;

    return {
      chart: {
        type: 'donut',
        height: 320,
        toolbar: { show: false },
        sparkline: { enabled: true },
      },
      series: [
        Math.max(firstIncome, 0),
        Math.max(firstExpense, 0),
        Math.max(secondIncome, 0),
        Math.max(secondExpense, 0),
      ],
      labels: ['Cuenta 1 ingresos', 'Cuenta 1 gastos', 'Cuenta 2 ingresos', 'Cuenta 2 gastos'],
      colors: ['#16a34a', '#ef4444', '#0f766e', '#f97316'],
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

  readonly categoryExpenseChartOptions = computed<CategoryExpenseChartOptions>(() => {
    const accounts = this.accounts();
    const categories = this.getCategoryNames(accounts);
    const series = accounts.map((account, index) => ({
      name: account.accountName,
      data: categories.map((categoryName) => {
        const category = account.expensesByCategory.find((entry) => entry.categoryName === categoryName);

        return Number((category?.amount ?? 0).toFixed(2));
      }),
    }));

    return {
      chart: {
        type: 'bar',
        height: 280,
        stacked: true,
        toolbar: { show: false },
        sparkline: { enabled: false },
      },
      series,
      colors: ['#2563eb', '#f97316', '#8b5cf6', '#10b981'],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '66%',
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories,
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
      this.openCreateAccountModal();
      return;
    }

    if (action.kind === 'create-transaction') {
      this.openCreateTransactionModal();
    }
  }

  closeModal(): void {
    if (this.createAccountBusy() || this.createTransactionBusy()) {
      return;
    }

    this.activeModal.set(null);
  }

  submitCreateAccount(): void {
    if (this.createAccountBusy()) {
      return;
    }

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const normalizedName = this.accountForm.controls.accountName.value.trim();

    if (!normalizedName) {
      this.accountForm.controls.accountName.setErrors({ required: true });
      this.accountForm.markAllAsTouched();
      return;
    }

    this.createAccountBusy.set(true);
    this.createAccountFeedback.set(null);

    this.ledgerSummaryService.createAccount(normalizedName).subscribe({
      next: () => {
        this.createAccountFeedback.set(`Cuenta "${normalizedName}" creada correctamente.`);
        this.accountForm.reset({ accountName: '' });
        this.activeModal.set(null);
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

  submitCreateTransaction(): void {
    if (this.createTransactionBusy()) {
      return;
    }

    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formValue = this.transactionForm.getRawValue();
    const account = this.accounts().find((entry) => entry.accountId === formValue.accountId);

    if (!account) {
      this.transactionForm.controls.accountId.setErrors({ min: true });
      this.transactionForm.markAllAsTouched();
      this.createTransactionFeedback.set('Selecciona una cuenta válida.');
      return;
    }

    const normalizedCurrency = formValue.currency.trim().toUpperCase();
    const description = formValue.description.trim();

    if (!normalizedCurrency) {
      this.transactionForm.controls.currency.setErrors({ required: true });
      this.transactionForm.markAllAsTouched();
      return;
    }

    if (!description) {
      this.transactionForm.controls.description.setErrors({ required: true });
      this.transactionForm.markAllAsTouched();
      return;
    }

    if (!Number.isInteger(formValue.transactionCategoryId)) {
      this.transactionForm.controls.transactionCategoryId.setErrors({ integer: true });
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.createTransactionBusy.set(true);
    this.createTransactionFeedback.set(null);

    this.ledgerSummaryService
      .createTransaction(account.accountId, {
        amount: formValue.amount,
        currency: normalizedCurrency,
        transaction_type: formValue.transactionType,
        transaction_date: this.toIsoDate(formValue.transactionDate),
        description,
        transaction_category_id: formValue.transactionCategoryId,
      })
      .subscribe({
        next: () => {
          this.createTransactionFeedback.set(`Transacción creada en "${account.accountName}".`);
          this.resetTransactionForm();
          this.activeModal.set(null);
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

  accountNameError(): string | null {
    const control = this.accountForm.controls.accountName;

    if (!control.touched && !control.dirty) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Escribe un nombre para la cuenta.';
    }

    return null;
  }

  transactionControlError(
    controlName:
      | 'accountId'
      | 'amount'
      | 'currency'
      | 'transactionType'
      | 'transactionDate'
      | 'description'
      | 'transactionCategoryId',
  ): string | null {
    const control = this.transactionForm.controls[controlName];

    if (!control.touched && !control.dirty) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (controlName === 'accountId' && control.hasError('min')) {
      return 'Selecciona una cuenta válida.';
    }

    if (controlName === 'amount' && control.hasError('min')) {
      return 'Introduce un importe mayor que cero.';
    }

    if (
      controlName === 'currency' &&
      (control.hasError('minlength') || control.hasError('maxlength'))
    ) {
      return 'Usa un código de moneda de 3 letras.';
    }

    if (controlName === 'transactionCategoryId' && control.hasError('min')) {
      return 'El ID de categoría debe ser mayor o igual que cero.';
    }

    if (controlName === 'transactionCategoryId' && control.hasError('integer')) {
      return 'El ID de categoría debe ser un número entero.';
    }

    return null;
  }

  private getCategoryNames(accounts: DashboardAccountViewModel[]): string[] {
    return Array.from(
      new Set(accounts.flatMap((account) => account.expensesByCategory.map((category) => category.categoryName))),
    );
  }

  private loadSummary(): void {
    this.ledgerSummaryService.loadSummary().subscribe({
      error: () => void 0,
    });
  }

  private openCreateAccountModal(): void {
    this.createAccountFeedback.set(null);
    this.accountForm.reset({ accountName: '' });
    this.activeModal.set('create-account');
  }

  private openCreateTransactionModal(): void {
    const accounts = this.accounts();

    if (!accounts.length) {
      this.createTransactionFeedback.set('No hay una cuenta válida para crear la transacción.');
      return;
    }

    this.createTransactionFeedback.set(null);
    this.resetTransactionForm(accounts[0]?.accountId ?? 0);
    this.activeModal.set('create-transaction');
  }

  private resetTransactionForm(accountId = this.accounts()[0]?.accountId ?? 0): void {
    this.transactionForm.reset({
      accountId,
      amount: 1,
      currency: 'USD',
      transactionType: 'expense',
      transactionDate: this.todayInputValue(),
      description: '',
      transactionCategoryId: 0,
    });
  }

  private todayInputValue(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toIsoDate(dateValue: string): string {
    const parsedDate = new Date(`${dateValue}T00:00:00`);

    return Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
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
