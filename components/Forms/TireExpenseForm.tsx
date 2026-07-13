"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { createTirePurchase } from "@/lib/api/transactions";
import { useProductForm } from "@/lib/Hooks/useProductForm";
import { ProductFormFields } from "./ProductFormFields";

type PaymentMethod = "Cash" | "Debit";

function nowLocal() {
  return new Date()
    .toLocaleString("sv-SE", {
      timeZone: "America/Chicago",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(" ", "T");
}

export function TireExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const form = useProductForm();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [createdAt, setCreatedAt] = useState(nowLocal());
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createTirePurchase({
        product: form.getPayload(),
        payment_method: paymentMethod as PaymentMethod,
        created_by: session?.user?.id || 10,
        created_at: new Date(createdAt).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      form.reset();
      setPaymentMethod("");
      setCreatedAt(nowLocal());
      setErrorMessage("");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.validate()) return;
    if (!paymentMethod) {
      setErrorMessage("Please select a payment method.");
      return;
    }
    setErrorMessage("");
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <ProductFormFields form={form} />

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Method</label>
        <select
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
        <label className="flex-2">Creation Time</label>
        <input
          type="datetime-local"
          className="p-2 border border-gray-300 rounded-lg flex-5"
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
          {mutation.isPending ? "Adding..." : "Add Tires"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{mutation.error.message}</p>
      )}
      {form.values.error && (
        <p className="text-sm text-red-500">{form.values.error}</p>
      )}
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </form>
  );
}
