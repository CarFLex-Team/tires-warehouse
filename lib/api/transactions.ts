export type CategoryType = "Sales" | "Expense";

export interface Transaction {
  id: string;
  category_id: number;
  category_name?: string;
  description: string;
  amount: number;
  type: CategoryType;
  payment_method: string;
  created_by_name?: string;
  created_at: string;
}
export interface TransactionSummary {
  total_transactions: number;
  total_sales_count: number;
  total_sales_amount: number;
  cash_sales_count: number;
  cash_sales_amount: number;
  debit_sales_count: number;
  debit_sales_amount: number;
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch("/api/transactions");
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}
export async function getTransactionsSummary(
  date?: string
): Promise<TransactionSummary> {
  const url = date
    ? `/api/transactions/summary?date=${date}`
    : "/api/transactions/summary";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch transactions summary");
  return res.json();
}
export async function createTransaction(data: {
  category_id: number;
  description: string;
  amount: number;
  type: CategoryType;
  payment_method: string;
}) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add transaction");
  return res.json();
}

export async function deleteTransaction(id: string) {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete transaction");
}
