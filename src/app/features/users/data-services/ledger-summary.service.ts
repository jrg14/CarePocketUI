import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { usersApiEndpoints } from './users-api-endpoints';
import {
  LedgerSummaryBalanceChangeSchema,
  LedgerSummaryBalanceChangeViewModel,
  LedgerSummaryLatestTransactionSchema,
  LedgerSummaryLatestTransactionViewModel,
  LedgerSummarySchema,
  LedgerSummaryTopExpenseCategorySchema,
  LedgerSummaryTopExpenseCategoryViewModel,
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

  createTransaction(
    accountId: number,
    payload: {
      amount: number;
      currency: string;
      transaction_type: 'income' | 'expense';
      transaction_date: string;
      description: string;
      transaction_category_id: number;
    },
  ): Observable<void> {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      return throwError(() => new Error('La cuenta no es válida.'));
    }

    return this.http.post<void>(this.apiUrl(`/api/v1/ledgers/accounts/${accountId}/transactions`), payload);
  }

  createAccount(accountName: string): Observable<void> {
    const normalizedName = accountName.trim();

    if (!normalizedName) {
      return throwError(() => new Error('El nombre de la cuenta no puede estar vacío.'));
    }

    return this.http.post<void>(this.apiUrl(usersApiEndpoints.ledgerAccounts), {
      account_name: normalizedName,
    });
  }

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
      balance: this.toNumber(response.balance),
      balanceChange: this.mapBalanceChange(response.balance_change),
      monthlyHealth: this.toNumber(response.monthly_health),
      topExpenseCategories: response.top_expense_categories.map((category) => this.mapTopExpenseCategory(category)),
      latestTransactions: response.latest_transactions.map((transaction) => this.mapLatestTransaction(transaction)),
    };
  }

  private mapBalanceChange(
    balanceChange: LedgerSummaryBalanceChangeSchema,
  ): LedgerSummaryBalanceChangeViewModel {
    return {
      percentage: this.toNumber(balanceChange.percentage),
      direction: balanceChange.direction,
    };
  }

  private mapTopExpenseCategory(
    category: LedgerSummaryTopExpenseCategorySchema,
  ): LedgerSummaryTopExpenseCategoryViewModel {
    return {
      categoryId: category.category_id,
      categoryName: category.category_name,
      amount: this.toNumber(category.amount),
    };
  }

  private mapLatestTransaction(
    transaction: LedgerSummaryLatestTransactionSchema,
  ): LedgerSummaryLatestTransactionViewModel {
    return {
      transactionId: transaction.transaction_id,
      amount: this.toNumber(transaction.amount),
      currency: transaction.currency,
      transactionType: transaction.transaction_type,
      transactionDate: transaction.transaction_date,
      description: transaction.description,
      transactionCategoryId: transaction.transaction_category_id,
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
