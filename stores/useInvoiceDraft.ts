import { Transaction } from "@/lib/api/transactions";
import { create } from "zustand";
export type TransactionType = "Sales" | "Expense";
// export type InvoiceItem = {
//   id: string;
//   category: string;
//   product_name?: string;
//   service_name?: string;
//   product_id?: string;
//   service_id?: string;
//   quantity: number;
//   description: string;
//   amount: number;
//   type: TransactionType;
//   payment_method: string;
//   created_by_name?: string;
//   created_at: string;
//   cost?: string;
//   condition?: string;
// };

type InvoiceDraftState = {
  customerId: string | null;
  items: Transaction[];
  setCustomer: (id: string) => void;
  setItems: (items: Transaction[]) => void;
  clear: () => void;
};

export const useInvoiceDraft = create<InvoiceDraftState>((set) => ({
  customerId: null,
  items: [],
  setCustomer: (id) => set({ customerId: id }),
  setItems: (items) => set({ items }),
  clear: () => set({ items: [], customerId: null }),
}));
