"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { createTransaction } from "@/lib/api/transactions";
import { useSession } from "next-auth/react";
import { AddProductForm } from "./addProductForm";
import { TireExpenseForm } from "./TireExpenseForm";

type CategoryType = "Sales" | "Expense";
type PaymentMethod = "Cash" | "Debit";

export function AddTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CategoryType | "">("Expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const date = new Date();

  const now = date
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
  const [createdAt, setCreatedAt] = useState(now);
  const [errorMessage, setErrorMessage] = useState("");
  // const filteredServices = services?.filter((c) => c.type === type);

  // useEffect(() => {
  //   setCategoryId("");
  // }, [type]);
  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transactionSummary"],
      });
      setDescription("");
      setType("");
      setCategory("");
      setAmount("");
      setPaymentMethod("");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !type || !amount || !paymentMethod) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    mutation.mutate({
      description,
      type,
      category: category,
      amount: Number(amount),
      payment_method: paymentMethod,
      created_by: session?.user?.id || 10,
      created_at: new Date(createdAt).toISOString(),
    });
  }

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Category</label>
        <div className="flex gap-2 flex-5">
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2  text-sm cursor-pointer  ${
              category === "Tire"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setCategory("Tire")}
          >
            Tire
          </button>

          <button
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2  text-sm cursor-pointer  ${
              category === "Operational"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setCategory("Operational")}
            type="button"
          >
            Operational
          </button>
        </div>
      </div>
      {category === "Tire" && <TireExpenseForm onSuccess={onSuccess} />}
      {category === "Operational" && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-8 ">
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
            <label className=" flex-2">Cost</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Cost Amount"
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
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
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
              {mutation.isPending ? "Adding..." : "Add Transaction"}
            </button>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">{mutation.error.message}</p>
          )}
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </form>
      )}
    </>
  );
}
