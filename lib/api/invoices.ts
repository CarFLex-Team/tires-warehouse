import { InvoiceItem } from "@/stores/useInvoiceDraft";
import { Invoice } from "./customers";
export async function getInvoices(): Promise<Invoice[]> {
  const res = await fetch(`/api/invoices`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}
export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) throw new Error("Failed to fetch invoice");
  return res.json();
}
export async function createInvoice(data: {
  total?: number;
  subtotal: number;
  tax?: number;
  customer_id: string;
  payment_method?: string;
  status: "pending" | "finished";
  transactions: InvoiceItem[];
}) {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add invoice");
  return res.json();
}
export async function editInvoice(
  id: string,
  data: {
    total_amount?: number;
    subtotal: number;
    tax?: number;
    payment_method?: string;
  },
) {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function deleteInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete invoice");
}
