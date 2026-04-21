import { InvoiceItem } from "@/stores/useInvoiceDraft";
import { Invoice } from "./customers";
import { Transaction } from "./transactions";
export interface InvoiceSummary {
  total_transactions: number;
  total_sales_count: number;
  total_sales_amount: number;
  cash_sales_count: number;
  cash_sales_amount: number;
  debit_sales_count: number;
  debit_sales_amount: number;
}
export async function getInvoices(
  status: "pending" | "finished",
  month?: string,
  date?: string,
): Promise<Invoice[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices?status=${status}${month ? `&month=${month}` : ""}${date ? `&date=${date}` : ""}`,
  );
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}
export async function getInvoiceSummary(
  month?: string,
  date?: string,
): Promise<InvoiceSummary> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/summary${month ? `?month=${month}` : date ? `?date=${date}` : ""}`,
  );
  if (!res.ok) throw new Error("Failed to fetch invoice summary");
  return res.json();
}
export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch invoice");
  return res.json();
}
export async function createInvoice(data: {
  total?: number;
  cash_amount?: number;
  debit_amount?: number;
  subtotal: number;
  tax?: number;
  customer_id: string;
  payment_method?: string;
  status: "pending" | "finished";
  transactions: InvoiceItem[];
  created_by: number;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) throw new Error("Failed to add invoice");
  return res.json();
}
export async function editInvoice(
  id: string,
  data: {
    total_amount?: number;
    cash_amount?: number;
    debit_amount?: number;
    subtotal: number;
    tax?: number;
    payment_method?: string;
    created_by: number;
  },
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}
export async function deleteInvoice(id: string, Transactions: Transaction[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: Transactions }),
    },
  );

  if (!res.ok) throw new Error("Failed to delete invoice");
}
