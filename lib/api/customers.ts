import { Transaction } from "./transactions";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  invoice_no: number;
  created_at: string;
  total_amount: string;
  created_by: string;
  invoice_status: string;
  payment_method: string;
  transactions: Transaction[];
}
export interface CustomerMonthlySummary {
  customer: string;
  turn_over: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/customers");
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}
export async function getCustomerById(id: string): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
}
export async function getCustomerMonthlySummary(
  month?: string,
): Promise<CustomerMonthlySummary[]> {
  const url = month
    ? `/api/customers/summary/monthly?month=${month}`
    : `/api/customers/summary`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch customers monthly summary");
  return res.json();
}
export async function createCustomer(data: {
  name: string;
  phone: string;
  email: string;
}) {
  const res = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add customer");
  return res.json();
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`/api/customers/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete customer");
}
