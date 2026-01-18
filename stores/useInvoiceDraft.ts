import { CategoryType } from "@/lib/api/categories";
import { create } from "zustand";

export type InvoiceItem = {
  id: string;
  category_id: string;
  description: string;
  amount: string;
  type: CategoryType;
};

type InvoiceDraftState = {
  customerId: string | null;
  items: InvoiceItem[];
  setCustomer: (id: string) => void;
  setItems: (items: InvoiceItem[]) => void;
  clear: () => void;
};

export const useInvoiceDraft = create<InvoiceDraftState>((set) => ({
  customerId: null,
  items: [],
  setCustomer: (id) => set({ customerId: id }),
  setItems: (items) => set({ items }),
  clear: () => set({ items: [], customerId: null }),
}));
