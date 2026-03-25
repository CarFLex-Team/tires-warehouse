"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { InfoCard } from "@/components/ui/InfoCard";
import { getInvoiceById } from "@/lib/api/invoices";
import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@/lib/api/customers";
import { Transaction } from "@/lib/api/transactions";
import formatDate from "@/lib/formatDate";
import CustomButton from "../ui/CustomButton";
import { downloadPdf } from "@/lib/api/donwloadPdf";
import { useState } from "react";

export default function invoiceTransactions({
  invoice_id,
}: {
  invoice_id: string;
}) {
  const [isdownloading, setIsDownloading] = useState(false);
  const { data, isLoading, error } = useQuery<Invoice>({
    queryKey: ["invoices", invoice_id],
    queryFn: () => getInvoiceById(invoice_id),
  });
  const transactions = data ? data?.transactions : [];
  const transactionColumns: TableColumn<Transaction>[] = [
    // { header: "Description", accessor: "description" },
    {
      header: "Product/Service",
      accessor: (tx) => tx.product_name || tx.service_name,
    },
    { header: "Quantity", accessor: "quantity" },
    { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category" },

    { header: "Amount", accessor: "amount" },
  ];

  return (
    <>
      <InfoCard
        title={"Invoice Total"}
        subtitle={`$${data?.total_amount || "Amount not available"}`}
        meta={`Created at ${data ? formatDate(data.created_at) : "Date not available"}`}
        isLoading={isLoading}
      />
      <DataTable
        title={`Invoice #${data?.invoice_no || ""}`}
        columns={transactionColumns}
        data={isLoading ? [] : transactions}
        isLoading={isLoading}
        action={
          <CustomButton
            onClick={() => {
              downloadPdf(data!, setIsDownloading);
            }}
            isLoading={isdownloading}
          >
            {isdownloading ? "Downloading..." : "Download PDF"}
          </CustomButton>
        }
      />
    </>
  );
}
