import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { usersApiEndpoints } from './users-api-endpoints';
import {
  LedgerSummaryAccountViewModel,
  LedgerSummaryAccountSchema,
  LedgerSummaryCategoryViewModel,
  LedgerSummaryCategorySchema,
  LedgerSummarySchema,
  LedgerSummaryViewModel,
} from '../models/ledger-summary.models';

@Injectable({
  providedIn: 'root',
})
export class LedgerSummaryService {
  private readonly http = inject(HttpClient);
  private readonly summarySignal = signal<LedgerSummaryViewModel | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private requestSequence = 0;

  readonly summary = computed(() => this.summarySignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  loadSummary(periodDays = 30): Observable<LedgerSummaryViewModel> {
    const boundedPeriodDays = this.normalizePeriodDays(periodDays);
    const requestId = ++this.requestSequence;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams().set('period_days', boundedPeriodDays);

    return this.http.get<LedgerSummarySchema>(this.apiUrl(usersApiEndpoints.ledgerSummary), { params }).pipe(
      map((response) => this.mapSummary(response)),
      tap((summary) => {
        if (requestId === this.requestSequence) {
          this.summarySignal.set(summary);
        }
      }),
      catchError((error: unknown) => {
        if (requestId === this.requestSequence) {
          this.errorSignal.set(this.getErrorMessage(error, 'No se ha podido cargar el resumen.'));
        }

        return throwError(() => error);
      }),
      finalize(() => {
        if (requestId === this.requestSequence) {
          this.loadingSignal.set(false);
        }
      }),
    );
  }

  private apiUrl(path: string): string {
    return `${environment.apiBaseUrl.replace(/\/$/, '')}${path}`;
  }

  private mapSummary(response: LedgerSummarySchema): LedgerSummaryViewModel {
    return {
      period: {
        days: response.period.period_days,
        start: this.toDate(response.period.period_start),
        end: this.toDate(response.period.period_end),
        previousStart: this.toDate(response.period.previous_period_start),
        previousEnd: this.toDate(response.period.previous_period_end),
      },
      overview: {
        totalBalance: this.toNumber(response.overview.total_balance),
        activeAccountsCount: response.overview.active_accounts_count,
        transactionsCount: response.overview.transactions_count,
        incomeTotal: this.toNumber(response.overview.income_total),
        expenseTotal: this.toNumber(response.overview.expense_total),
        netFlow: this.toNumber(response.overview.net_flow),
        averageDailyIncome: this.toNumber(response.overview.average_daily_income),
        averageDailyExpense: this.toNumber(response.overview.average_daily_expense),
        lastTransactionAt: response.overview.last_transaction_at
          ? this.toDate(response.overview.last_transaction_at)
          : null,
      },
      topAccounts: response.top_accounts.map((account) => this.mapAccount(account)),
      expensesByCategory: response.expenses_by_category.map((category) => this.mapCategory(category)),
      incomeByCategory: response.income_by_category.map((category) => this.mapCategory(category)),
      trends: {
        incomeChangePct: response.trends.income_change_pct,
        expenseChangePct: response.trends.expense_change_pct,
        projectedBalanceNextPeriod: this.toNumber(response.trends.projected_balance_next_period),
      },
      alerts: response.alerts,
      recommendations: response.recommendations,
    };
  }

  private mapAccount(account: LedgerSummaryAccountSchema): LedgerSummaryAccountViewModel {
    return {
      accountId: account.account_id,
      accountName: account.account_name,
      balance: this.toNumber(account.balance),
      transactionCount: account.transaction_count,
    };
  }

  private mapCategory(category: LedgerSummaryCategorySchema): LedgerSummaryCategoryViewModel {
    return {
      categoryId: category.category_id,
      categoryName: category.category_name,
      amount: this.toNumber(category.amount),
      transactionCount: category.transaction_count,
    };
  }

  private normalizePeriodDays(periodDays: number): number {
    if (!Number.isFinite(periodDays)) {
      return 30;
    }

    return Math.min(365, Math.max(7, Math.trunc(periodDays)));
  }

  private toNumber(value: number | string): number {
    const parsed = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toDate(value: string): Date {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;

      if (Array.isArray(detail)) {
        const messages = detail
          .map((entry: unknown) => {
            if (entry && typeof entry === 'object') {
              const candidate = entry as { msg?: unknown; message?: unknown };

              return typeof candidate.msg === 'string'
                ? candidate.msg
                : typeof candidate.message === 'string'
                  ? candidate.message
                  : '';
            }

            return '';
          })
          .filter(Boolean);

        if (messages.length) {
          return messages.join(' ');
        }
      }

      if (typeof detail === 'string') {
        return detail;
      }

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }
    }

    return fallback;
  }
}
