"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService } from "@/lib/api/services";
import { useState } from "react";

export function AddServiceForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const mutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setName("");
      setPrice("");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;

    mutation.mutate({ name, price: Number(price) });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Service</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Service Name"
          required
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Price</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter Price"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Adding..." : "Add Service"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">
          Failed to add service {mutation.error.message}
        </p>
      )}
    </form>
  );
}
