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
  if (error) return <p>Error {error.message}</p>;
  return (
    <>
      <InfoCard
        title={"Invoice Details"}
        // subtitle={`Total $${data?.total_amount || "Amount not available"}`}
        extraSubtitle={
          <>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Subtotal</span> $
              {data?.subtotal || "0.00"}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Tax</span> ${data?.tax || "0.00"}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Total</span> $
              {data?.total_amount || "0.00"}
            </p>
            <p className="text-sm text-gray-500">
              <span className="text-red-500 font-medium">Cash</span> $
              {data?.cash_amount || "0.00"} |{" "}
              <span className="text-purple-500 font-medium">Debit</span> $
              {data?.debit_amount || "0.00"}
            </p>
          </>
        }
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
