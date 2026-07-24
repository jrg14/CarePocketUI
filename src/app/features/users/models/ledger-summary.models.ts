export type LedgerDecimalValue = string | number;

export interface LedgerSummaryCategorySchema {
  category_id: number | null;
  category_name: string;
  amount: LedgerDecimalValue;
}

export interface LedgerSummaryAccountSchema {
  account_id: number;
  account_name: string;
  balance: LedgerDecimalValue;
  income: LedgerDecimalValue;
  expense: LedgerDecimalValue;
  expenses_by_category: LedgerSummaryCategorySchema[];
}

export interface LedgerSummaryTotalsSchema {
  balance: LedgerDecimalValue;
  income: LedgerDecimalValue;
  expense: LedgerDecimalValue;
  expenses_by_category: LedgerSummaryCategorySchema[];
}

export interface LedgerSummarySchema {
  totals: LedgerSummaryTotalsSchema;
  accounts: LedgerSummaryAccountSchema[];
}

export interface LedgerSummaryAccountViewModel {
  accountId: number;
  accountName: string;
  balance: number;
  income: number;
  expense: number;
  expensesByCategory: LedgerSummaryCategoryViewModel[];
}

export interface LedgerSummaryCategoryViewModel {
  categoryId: number | null;
  categoryName: string;
  amount: number;
}

export interface LedgerSummaryTotalsViewModel {
  balance: number;
  income: number;
  expense: number;
  expensesByCategory: LedgerSummaryCategoryViewModel[];
}

export interface LedgerSummaryViewModel {
  totals: LedgerSummaryTotalsViewModel;
  accounts: LedgerSummaryAccountViewModel[];
}
