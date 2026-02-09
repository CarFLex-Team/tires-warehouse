import { Invoice } from "./customers";

export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) throw new Error("Failed to fetch invoice");
  return res.json();
}
export async function createInvoice(data: {
  total: number;
  subtotal: number;
  tax: number;
  customer_id: string;
  payment_method: string;
  transactions: any[];
}) {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add invoice");
  return res.json();
}

export async function deleteInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete invoice");
}
