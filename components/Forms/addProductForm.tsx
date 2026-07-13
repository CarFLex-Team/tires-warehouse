"use client";

import { createInventoryProduct } from "@/lib/api/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductForm } from "@/lib/Hooks/useProductForm";
import { ProductFormFields } from "./ProductFormFields";

export function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const form = useProductForm();

  const mutation = useMutation({
    mutationFn: createInventoryProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      form.reset();
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.validate()) return;
    mutation.mutate(form.getPayload());
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <ProductFormFields form={form} />
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Adding..." : "Add Product"}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500">
          Failed to add product {mutation.error.message}
        </p>
      )}
      {form.values.error && (
        <p className="text-sm text-red-500">{form.values.error}</p>
      )}
    </form>
  );
}
