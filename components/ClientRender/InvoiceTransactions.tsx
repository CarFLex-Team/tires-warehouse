"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useEffect, useState } from "react";
import { InfoCard } from "@/components/ui/InfoCard";
type Transaction = {
  category: string;
  description: string;
  amount: number;
};

export default function invoiceTransactions({
  invoice,
  customer,
}: {
  invoice: any;
  customer: any;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);
  const transactions = invoice ? invoice.transactions : [];
  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
  ];

  return (
    <>
      <InfoCard
        title={"Invoice Total"}
        subtitle={`$${invoice?.amount || "Amount not available"}`}
        meta={`Created at ${invoice?.createdAt || "Date not available"}`}
      />
      <DataTable
        title={`Invoice #${invoice?.id}`}
        columns={transactionColumns}
        data={isLoading ? [] : transactions}
        isLoading={isLoading}
      />
    </>
  );
}
