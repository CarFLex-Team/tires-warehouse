"use client";
import { useEffect, useState } from "react";
import { InvoiceTable } from "../Tables/InvoiceTable";
import CustomButton from "../ui/CustomButton";
import { useRouter } from "next/navigation";
import { InvoiceItem, useInvoiceDraft } from "@/stores/useInvoiceDraft";
import { getInventory } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";

export default function CreateNewInvoice({
  customer_Id,
}: {
  customer_Id: string;
}) {
  const [rows, setRows] = useState<InvoiceItem[]>([]);
  const [showAlert, setShowAlert] = useState<string>("");
  const setItems = useInvoiceDraft((s) => s.setItems);
  const setCustomer = useInvoiceDraft((s) => s.setCustomer);
  const router = useRouter();
  const { items, customerId } = useInvoiceDraft((s) => s);
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: getInventory,
  });
  useEffect(() => {
    if (items.length && customerId === customer_Id) {
      setRows(items);
    }
  }, [items, customerId, customer_Id]);
  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: "",
        product_name: "",
        service_name: "",
        description: "",
        amount: "",
        quantity: 1,
        type: "Sales",
      },
    ]);
    setShowAlert("");
  }
  function updateRow(
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
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
    if (
      rows.some(
        (row) =>
          !row.category ||
          !row.type ||
          (!row.product_name && row.category === "Tire") ||
          (!row.service_name && row.category === "Service") ||
          row.quantity <= 0,
      )
    ) {
      setShowAlert("Please fill in all fields for each transaction.");
      return;
    }
    for (const row of rows) {
      if (row.category === "Tire") {
        const product = products?.find(
          (prod: any) => prod.id === row.product_id,
        );
        if (product && row.quantity > product.quantity) {
          setShowAlert(
            `Not enough inventory for ${product.name}. Available: ${product.quantity}`,
          );
          return;
        }
      }
    }
    setShowAlert("");
    console.log("Create payload:", rows);
    setCustomer(customer_Id);
    setItems(rows);
    router.push(`/customers/${customer_Id}/invoices/new/review`);
  }

  return (
    <div className=" relative space-y-4 bg-white p-5 m-4 rounded-xl shadow-sm">
      <InvoiceTable
        rows={rows}
        onAdd={addRow}
        onUpdate={updateRow}
        onRemove={removeRow}
        products={products}
      />
      {showAlert && <div className="text-red-500 text-sm">{showAlert}</div>}
      <div className="flex justify-end gap-3">
        <CustomButton onClick={submit}>Review & Submit</CustomButton>
      </div>
    </div>
  );
}
