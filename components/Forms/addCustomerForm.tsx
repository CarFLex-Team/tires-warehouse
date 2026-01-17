"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ComboBox } from "../ui/ComboBox";
import { createCustomer } from "@/lib/api/customers";

export function AddCustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setName("");
      setEmail("");
      setPhone("");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone) {
      return;
    }

    mutation.mutate({
      name,
      email,
      phone,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Name</label>
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={name}
          placeholder="Enter Name"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className=" flex-2">Email</label>
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-lg flex-5"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className=" flex-2">Phone</label>
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-lg flex-5"
          placeholder="Enter Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Adding..." : "Add Customer"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">{mutation.error.message}</p>
      )}
    </form>
  );
}
