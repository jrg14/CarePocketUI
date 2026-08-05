export type LedgerDecimalValue = string | number;

export interface LedgerSummaryBalanceChangeSchema {
  percentage: LedgerDecimalValue;
  direction: 'improvement' | 'decline';
}

export interface LedgerSummaryTopExpenseCategorySchema {
  category_id: number | null;
  category_name: string;
  amount: LedgerDecimalValue;
}

export interface LedgerSummaryLatestTransactionSchema {
  transaction_id: number;
  amount: LedgerDecimalValue;
  currency: string;
  transaction_type: 'income' | 'expense';
  transaction_date: string;
  description: string;
  transaction_category_id: number | null;
}

export interface LedgerSummarySchema {
  balance: LedgerDecimalValue;
  balance_change: LedgerSummaryBalanceChangeSchema;
  monthly_health: LedgerDecimalValue;
  top_expense_categories: LedgerSummaryTopExpenseCategorySchema[];
  latest_transactions: LedgerSummaryLatestTransactionSchema[];
}

export interface LedgerSummaryBalanceChangeViewModel {
  percentage: number;
  direction: 'improvement' | 'decline';
}

export interface LedgerSummaryTopExpenseCategoryViewModel {
  categoryId: number | null;
  categoryName: string;
  amount: number;
}

export interface LedgerSummaryLatestTransactionViewModel {
  transactionId: number;
  amount: number;
  currency: string;
  transactionType: 'income' | 'expense';
  transactionDate: string;
  description: string;
  transactionCategoryId: number | null;
}

export interface LedgerSummaryViewModel {
  balance: number;
  balanceChange: LedgerSummaryBalanceChangeViewModel;
  monthlyHealth: number;
  topExpenseCategories: LedgerSummaryTopExpenseCategoryViewModel[];
  latestTransactions: LedgerSummaryLatestTransactionViewModel[];
}
