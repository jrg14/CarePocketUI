export type LedgerDecimalValue = string | number;

export interface LedgerSummaryPeriodSchema {
  period_days: number;
  period_start: string;
  period_end: string;
  previous_period_start: string;
  previous_period_end: string;
}

export interface LedgerSummaryOverviewSchema {
  total_balance: LedgerDecimalValue;
  active_accounts_count: number;
  transactions_count: number;
  income_total: LedgerDecimalValue;
  expense_total: LedgerDecimalValue;
  net_flow: LedgerDecimalValue;
  average_daily_income: LedgerDecimalValue;
  average_daily_expense: LedgerDecimalValue;
  last_transaction_at: string | null;
}

export interface LedgerSummaryAccountSchema {
  account_id: number;
  account_name: string;
  balance: LedgerDecimalValue;
  transaction_count: number;
}

export interface LedgerSummaryCategorySchema {
  category_id: number | null;
  category_name: string;
  amount: LedgerDecimalValue;
  transaction_count: number;
}

export interface LedgerSummaryTrendSchema {
  income_change_pct: number;
  expense_change_pct: number;
  projected_balance_next_period: LedgerDecimalValue;
}

export interface LedgerSummarySchema {
  period: LedgerSummaryPeriodSchema;
  overview: LedgerSummaryOverviewSchema;
  top_accounts: LedgerSummaryAccountSchema[];
  expenses_by_category: LedgerSummaryCategorySchema[];
  income_by_category: LedgerSummaryCategorySchema[];
  trends: LedgerSummaryTrendSchema;
  alerts: string[];
  recommendations: string[];
}

export interface LedgerSummaryPeriodViewModel {
  days: number;
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

export interface LedgerSummaryOverviewViewModel {
  totalBalance: number;
  activeAccountsCount: number;
  transactionsCount: number;
  incomeTotal: number;
  expenseTotal: number;
  netFlow: number;
  averageDailyIncome: number;
  averageDailyExpense: number;
  lastTransactionAt: Date | null;
}

export interface LedgerSummaryAccountViewModel {
  accountId: number;
  accountName: string;
  balance: number;
  transactionCount: number;
}

export interface LedgerSummaryCategoryViewModel {
  categoryId: number | null;
  categoryName: string;
  amount: number;
  transactionCount: number;
}

export interface LedgerSummaryTrendViewModel {
  incomeChangePct: number;
  expenseChangePct: number;
  projectedBalanceNextPeriod: number;
}

export interface LedgerSummaryViewModel {
  period: LedgerSummaryPeriodViewModel;
  overview: LedgerSummaryOverviewViewModel;
  topAccounts: LedgerSummaryAccountViewModel[];
  expensesByCategory: LedgerSummaryCategoryViewModel[];
  incomeByCategory: LedgerSummaryCategoryViewModel[];
  trends: LedgerSummaryTrendViewModel;
  alerts: string[];
  recommendations: string[];
}
