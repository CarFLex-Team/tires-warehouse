"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { redirect, useRouter } from "next/navigation";
import { useInvoiceDraft } from "@/stores/useInvoiceDraft";
export default function review() {
  const router = useRouter();
  const { items, customerId } = useInvoiceDraft();

  if (!items.length || !customerId) {
    redirect(`/customers`);
  }

  type Item = {
    id: string;
    category: string;
    description: string;
    amount: string;
  };

  const customerColumns: TableColumn<Item>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
  ];

  return (
    <>
      <div>
        <DataTable columns={customerColumns} data={items} />
      </div>
    </>
  );
}
