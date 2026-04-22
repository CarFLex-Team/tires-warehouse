"use client";
import { useQuery } from "@tanstack/react-query";
import invoiceColumns from "../columns/InvoiceColumn";
import { DataTable } from "../Tables/DataTable";
import { getInvoices } from "@/lib/api/invoices";
import { Invoice } from "@/lib/api/customers";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvoicesInTime({
  date,
  month,
  renderActions,
  setError,
}: {
  date?: string;
  month?: string;
  renderActions: (invoice: Invoice) => React.ReactNode;
  setError: (message: string) => void;
}) {
  const router = useRouter();
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "Debit" | "Cash">(
    "ALL",
  );
  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ["invoices", date ? date : month],
    queryFn: () => getInvoices("finished", month, date),
  });
  if (error) {
    setError(error.message || "An error occurred while fetching invoices");
  }
  return (
    <DataTable
      title="Invoices"
      columns={invoiceColumns}
      hoverable={true}
      action={
        <div className="flex">
          <p className="p-2 text-sm">Payment Filter:</p>
          <button
            className={`flex items-center gap-1.5 border-b border-gray-300 p-2  text-sm cursor-pointer  ${
              paymentFilter === "Cash"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() =>
              paymentFilter === "Cash"
                ? setPaymentFilter("ALL")
                : setPaymentFilter("Cash")
            }
            type="button"
          >
            Cash Invoices
          </button>
          <button
            className={`flex items-center gap-1.5  border-b border-gray-300 border-l-0 p-2  text-sm cursor-pointer  ${
              paymentFilter === "Debit"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() =>
              paymentFilter === "Debit"
                ? setPaymentFilter("ALL")
                : setPaymentFilter("Debit")
            }
            type="button"
          >
            Debit Invoices
          </button>
        </div>
      }
      data={
        isLoading
          ? []
          : data?.filter((invoice) => {
              if (paymentFilter === "ALL") return true;
              if (invoice.payment_method === "Mix") return true;
              return invoice.payment_method === paymentFilter;
            }) || []
      }
      isLoading={isLoading}
      onRowClick={(invoice) =>
        invoice.status === "finished" &&
        router.push(`customers/${invoice.customer_id}/invoices/${invoice.id}`)
      }
      renderActions={renderActions}
    />
  );
}
