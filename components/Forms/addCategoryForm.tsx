"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/lib/api/categories";
import { useState } from "react";

type CategoryType = "Sales" | "Expense";

export function AddCategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType | "">("");

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setType("");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !type) return;

    mutation.mutate({ name, type });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Category</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Category Name"
          required
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Type</label>
        <select
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          required
        >
          <option value="" disabled>
            Category Type
          </option>
          <option value="Sales">Sales</option>
          <option value="Expense">Expense</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Adding..." : "Add Category"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">
          Failed to add category {mutation.error.message}
        </p>
      )}
    </form>
  );
}
