"use client";

import { useState } from "react";

import { Trash2, Plus } from "lucide-react";
import { InvoiceTable } from "./InvoiceTable";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function CreateTransactions() {
  const [rows, setRows] = useState<Row[]>([]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        email: "",
        phone: "",
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
    <div className="space-y-4">
      <InvoiceTable
        rows={rows}
        onAdd={addRow}
        onUpdate={updateRow}
        onRemove={removeRow}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={addRow}
          className="flex items-center gap-2 rounded border px-4 py-2 text-sm"
        >
          <Plus size={16} />
          Add Row
        </button>

        <button
          onClick={submit}
          className="rounded bg-primary px-4 py-2 text-sm text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}
