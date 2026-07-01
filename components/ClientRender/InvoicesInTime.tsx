"use client";
import { useQuery } from "@tanstack/react-query";
import { invoiceColumns } from "../columns/InvoiceColumn";
import { DataTable } from "../Tables/DataTable";
import { getInvoices, getInvoiceSizes } from "@/lib/api/invoices";
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
  const [open, setOpen] = useState(false);
  const [hoveredInvoiceId, setHoveredInvoiceId] = useState<string | null>(null);
  const [invoceNumber, setInvoiceNumber] = useState<number | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<
    "ALL" | "Debit" | "Cash" | "Check"
  >("ALL");
  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ["invoices", date ? date : month],
    queryFn: () => getInvoices("finished", month, date),
  });
  const {
    data: sizes,
    isLoading: sizesLoading,
    error: sizesError,
  } = useQuery<string[]>({
    queryKey: ["invoice-sizes", hoveredInvoiceId],
    queryFn: () => getInvoiceSizes(hoveredInvoiceId!),
    enabled: !!hoveredInvoiceId && open,
    staleTime: 5 * 60 * 1000,
  });
  const handleRowHover = (invoice: Invoice) => {
    if (!invoice) {
      setInvoiceNumber(null);
      setHoveredInvoiceId(null);
      setOpen(false);
      return;
    }
    setHoveredInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoice_no);
    setOpen(true);
  };
  if (error) {
    setError(error.message || "An error occurred while fetching invoices");
  }
  return (
    <>
      {open && (
        <div className="absolute z-50  min-w-35 rounded-md border border-gray-200 bg-primary-600 text-white p-2 shadow-lg">
          {sizesLoading && <p className="text-sm ">Loading sizes...</p>}
          {sizesError && (
            <p className="text-sm text-red-500">Failed to load sizes</p>
          )}
          {!sizesLoading && !sizesError && sizes?.length === 0 && (
            <p className="text-sm ">No tires on this invoice</p>
          )}
          {!sizesLoading && !sizesError && sizes && sizes.length > 0 && (
            <>
              <p className="text-sm font-medium">Invoice {invoceNumber}</p>
              <ul className="space-y-1">
                {sizes.map((size) => (
                  <li key={size} className="text-sm ">
                    {size}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      <DataTable
        title="Invoices"
        columns={invoiceColumns}
        hoverable={true}
        onRowHover={handleRowHover}
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
    </>
  );
}
