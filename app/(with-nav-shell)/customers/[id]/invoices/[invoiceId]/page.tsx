"use client";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import { useEffect, useState } from "react";
import customers from "@/data/customers.json";
import { InfoCard } from "@/components/ui/InfoCard";
export default function invoice() {
  const customer = customers.find((c) => c.id === Number(1));
  const transactions = customer ? customer.invoices[0].transactions : [];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  type Transaction = {
    category: string;
    description: string;
    amount: number;
  };

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
  ];

  return (
    <>
      <InfoCard
        title={"Invoice Total"}
        subtitle={`$${customer?.invoices[0].amount || "Amount not available"}`}
        meta={`Created at ${
          customer?.invoices[0].createdAt || "Date not available"
        }`}
      />
      <DataTable
        title={`Invoice #${customer?.invoices[0].id}`}
        columns={transactionColumns}
        data={isLoading ? [] : transactions}
        isLoading={isLoading}
      />
    </>
  );
}
