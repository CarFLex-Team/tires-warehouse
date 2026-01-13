"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";
import { useState } from "react";
import { ComboBox } from "../ui/ComboBox";
import { createTransaction } from "@/lib/api/transactions";

type CategoryType = "Sales" | "Expense";
type PaymentMethod = "Cash" | "Debit";

export function AddTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CategoryType | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const filteredCategories = categories?.filter((c) => c.type === type);

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDescription("");
      setType("");
      setCategoryId("");
      setAmount("");
      setPaymentMethod("");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !type || !categoryId || !amount || !paymentMethod) {
      return;
    }

    mutation.mutate({
      description,
      type,
      category_id: Number(categoryId),
      amount: Number(amount),
      payment_method: paymentMethod,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Type</label>
        <select
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          required
        >
          <option value="" disabled>
            Transaction Type
          </option>
          <option value="Sales">Sales</option>
          <option value="Expense">Expense</option>
        </select>
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Category</label>

        <ComboBox
          value={categoryId}
          options={
            filteredCategories?.map((cat: any) => ({
              label: cat.name,
              value: cat.id,
            })) || []
          }
          className="p-2 border border-gray-300 rounded-lg flex-5"
          placeholder="Category"
          onChange={(value) => setCategoryId(value)}
          required
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Description</label>
        <textarea
          rows={2}
          className="p-2 border border-gray-300 rounded-lg flex-5"
          placeholder="Enter Transaction Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className=" flex-2">Amount</label>
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-lg flex-5"
          placeholder="Enter Price Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className=" flex-2">Method</label>
        <select
          name="paymentMethod"
          id="paymentMethod"
          className="p-2 border border-gray-300 rounded-lg flex-5 text-gray-700"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          required
        >
          <option disabled value="">
            Payment Method
          </option>
          <option value="Cash">Cash</option>
          <option value="Debit">Debit</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Adding..." : "Add Transaction"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{mutation.error.message}</p>
      )}
    </form>
  );
}
