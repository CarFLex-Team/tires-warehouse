export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: number;
  created_at: string;
  total_amount: string;
  created_by: string;
  invoice_status: string;
  payment_method: string;
}
// export interface TransactionSummary {
//   total_transactions: number;
//   total_sales_count: number;
//   total_sales_amount: number;
//   cash_sales_count: number;
//   cash_sales_amount: number;
//   debit_sales_count: number;
//   debit_sales_amount: number;
// }

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
