"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService } from "@/lib/api/services";
import { useState } from "react";

export function DownPaymentForm({
  onSuccess,
  downPayment,
  setDownPayment,
  isPending,
  error,
}: {
  onSuccess: () => void;
  downPayment: string;
  setDownPayment: (amount: string) => void;
  isPending: boolean;
  error: any;
}) {
  return (
    <form className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">
          Down Payment <span className="text-sm text-gray-500">(optional)</span>
        </label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={downPayment}
          onChange={(e) => setDownPayment(e.target.value)}
          placeholder="Enter Down Payment"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          disabled={isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
          onClick={(e) => {
            e.preventDefault();
            onSuccess();
          }}
        >
          {isPending ? "Saving..." : "Save as Pending"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          Failed to save down payment {error.message}
        </p>
      )}
    </form>
  );
}
