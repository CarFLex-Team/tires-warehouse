"use client";

import { useState } from "react";

import { Trash2, Plus } from "lucide-react";
import { InvoiceTable } from "./InvoiceTable";

type Row = {
  id: string;
  category: string;
  description: string;
  amount: string;
};

export default function CreateTransactions() {
  const [rows, setRows] = useState<Row[]>([]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: "",
        description: "",
        amount: "",
      },
    ]);
  }

  function updateRow(id: string, field: keyof Row, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function submit() {
    console.log("Create payload:", rows);
    // later → POST /api/transactions
  }

  return (
    <div className=" relative space-y-4 bg-white p-5 m-4 rounded-xl shadow-sm">
      <InvoiceTable
        rows={rows}
        onAdd={addRow}
        onUpdate={updateRow}
        onRemove={removeRow}
      />

      <div className="flex justify-between gap-3">
        <button
          onClick={addRow}
          className="flex items-center gap-2 rounded border bg-primary-600 text-white px-2 py-1 text-sm cursor-pointer"
        >
          <Plus size={16} />
          Add Item
        </button>

        <button
          onClick={submit}
          className="rounded bg-primary-600 px-4 py-2 text-sm text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}
