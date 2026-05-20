"use client";
import { useQuery } from "@tanstack/react-query";
import invoiceColumns from "../columns/InvoiceColumn";
import { DataTable } from "../Tables/DataTable";
import { getInvoices, getInvoicesWithProducts } from "@/lib/api/invoices";
import { Invoice } from "@/lib/api/customers";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Invoices({
  actions,
  date,
  month,
  renderActions,
  setError,
}: {
  actions?: React.ReactNode;
  date?: string;
  month?: string;
  renderActions: (invoice: Invoice) => React.ReactNode;
  setError: (message: string) => void;
}) {
  const router = useRouter();
  const [paymentFilter, setPaymentFilter] = useState<
    "ALL" | "Debit" | "Cash" | "Check"
  >("ALL");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ["invoices", date ? date : month, search],
    queryFn: () => getInvoicesWithProducts("finished", month, date, search),
  });
  // console.log("Fetched Invoices:", search);
  if (error) {
    setError(error.message || "An error occurred while fetching invoices");
  }
  return (
    <DataTable
      columns={invoiceColumns}
      hoverable={true}
      action={
        <div className="w-full">
          <div className="w-full flex items-center gap-2 justify-between">
            <input
              type="text"
              placeholder="Search by tire sizes xx/xx/xx"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className=" p-2 border-b border-gray-300 focus:outline-none min-w-47"
            />
            {actions}
          </div>

          <div className="w-full flex items-center gap-4 justify-end">
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
              <button
                className={`flex items-center gap-1.5  border-b border-gray-300 border-l-0 p-2  text-sm cursor-pointer  ${
                  paymentFilter === "Check"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-primary-600 hover:bg-gray-100"
                }`}
                onClick={() =>
                  paymentFilter === "Check"
                    ? setPaymentFilter("ALL")
                    : setPaymentFilter("Check")
                }
                type="button"
              >
                Check Invoices
              </button>
            </div>
          </div>
        </div>
      }
      data={
        isLoading
          ? []
          : data?.filter((invoice) => {
              if (paymentFilter === "ALL") return true;
              // if (invoice.payment_method === "Mix") return true;
              return (
                invoice.payment_method === paymentFilter ||
                (paymentFilter === "Debit" && invoice.debit_amount! > 0) ||
                (paymentFilter === "Check" && invoice.check_amount! > 0) ||
                (paymentFilter === "Cash" && invoice.cash_amount! > 0)
              );
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
