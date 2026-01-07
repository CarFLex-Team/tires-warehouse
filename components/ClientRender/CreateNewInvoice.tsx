"use client";
import { useEffect, useState } from "react";
import { InvoiceTable } from "../Tables/InvoiceTable";
import CustomButton from "../ui/CustomButton";
import { useRouter } from "next/navigation";
import { useInvoiceDraft } from "@/stores/useInvoiceDraft";

type Row = {
  id: string;
  category: string;
  description: string;
  amount: string;
};

export default function CreateNewInvoice({ customer }: { customer: any }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [showAlert, setShowAlert] = useState<string>("");
  const setItems = useInvoiceDraft((s) => s.setItems);
  const setCustomer = useInvoiceDraft((s) => s.setCustomer);
  const router = useRouter();
  const items = useInvoiceDraft((s) => s.items);
  useEffect(() => {
    if (items.length) {
      setRows(items);
    }
  }, []);
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
    setShowAlert("");
  }

  function updateRow(id: string, field: keyof Row, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    setShowAlert("");
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function submit() {
    if (rows.length === 0) {
      setShowAlert("Please add at least one transaction.");
      return;
    }
    if (rows.some((row) => !row.category || !row.description || !row.amount)) {
      setShowAlert("Please fill in all fields for each transaction.");
      return;
    }
    setShowAlert("");
    console.log("Create payload:", rows);
    setCustomer(customer.id);
    setItems(rows);
    router.push(`/customers/${customer.id}/invoices/new/review`);
  }

  return (
    <div className=" relative space-y-4 bg-white p-5 m-4 rounded-xl shadow-sm">
      <InvoiceTable
        rows={rows}
        onAdd={addRow}
        onUpdate={updateRow}
        onRemove={removeRow}
      />
      {showAlert && <div className="text-red-500 text-sm">{showAlert}</div>}
      <div className="flex justify-end gap-3">
        <CustomButton onClick={submit}>Review & Submit</CustomButton>
      </div>
    </div>
  );
}
