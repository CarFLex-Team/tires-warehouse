"use client";

import { editTransaction, Transaction } from "@/lib/api/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useEffect, useState } from "react";
type PaymentMethod = "Cash" | "Debit";
export default function EditProductForm({
  onSuccess,
  payOutTransaction,
}: {
  onSuccess: () => void;
  payOutTransaction: Transaction;
}) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("" as PaymentMethod | "");
  const [createdAt, setCreatedAt] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (payOutTransaction) {
      const date = new Date(payOutTransaction.created_at);

      const formattedChicago = date
        .toLocaleString("sv-SE", {
          timeZone: "America/Chicago",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(" ", "T"); // "2026-05-13T02:31"
      setDescription(payOutTransaction.description);
      setAmount(payOutTransaction.amount.toString());
      setPaymentMethod(payOutTransaction.payment_method as PaymentMethod | "");
      setCreatedAt(formattedChicago);
      setCategory(payOutTransaction.category);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (data: {
      description: string;
      amount: number;
      payment_method: PaymentMethod;
      created_at: string;
      category: string;
    }) => editTransaction(payOutTransaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDescription("");
      setAmount("");
      setPaymentMethod("");
      setCreatedAt("");
      setError(null);
      onSuccess();
    },
  });
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !description ||
      !amount ||
      isNaN(Number(amount)) ||
      !paymentMethod ||
      (paymentMethod !== "Cash" && paymentMethod !== "Debit")
    )
      return setError("Please fill in fields with valid numbers");

    mutation.mutate({
      description,
      amount: Number(amount),
      payment_method: paymentMethod,
      created_at: new Date(createdAt).toISOString(),
      category: category,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-8 ">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Type</label>
        <div className="flex gap-2 flex-5">Expense</div>
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
        <label className=" flex-2">Category</label>
        <select
          name="category"
          id="category"
          className="p-2 border border-gray-300 rounded-lg flex-5 text-gray-700"
          value={category || ""}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option disabled value="">
            Category
          </option>
          <option value="Tire">Tire</option>
          <option value="Operational">Operational</option>
        </select>
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
      <div className="flex justify-between items-center gap-4">
        <label className=" flex-2">Creation Time</label>
        <input
          type="datetime-local"
          className="p-2 border border-gray-300 rounded-lg flex-5"
          placeholder="Enter Price Amount"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Transaction"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{mutation.error.message}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
