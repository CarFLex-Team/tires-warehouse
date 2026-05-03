"use client";
import { useQuery } from "@tanstack/react-query";
import invoiceColumns from "../columns/InvoiceColumn";
import { DataTable } from "../Tables/DataTable";
import CustomButton from "../ui/CustomButton";
import { Invoice } from "@/lib/api/customers";
import { getInvoices } from "@/lib/api/invoices";
import { useRouter } from "next/navigation";
import { useInvoiceDraft } from "@/stores/useInvoiceDraft";

export default function PendingInvoices({
  renderActions,
  setError,
}: {
  renderActions: (invoice: Invoice) => React.ReactNode;
  setError: (message: string) => void;
}) {
  const router = useRouter();
  const clear = useInvoiceDraft((s) => s.clear);
  const {
    data: invoiceData,
    isLoading: invoiceLoading,
    error: invoiceError,
  } = useQuery<Invoice[]>({
    queryKey: ["invoices", "pending"],
    queryFn: () => getInvoices("pending"),
  });
  if (invoiceError) {
    setError(
      invoiceError.message || "An error occurred while fetching invoices",
    );
  }
  return (
    <>
      <DataTable
        title="Pending Invoices "
        columns={invoiceColumns}
        data={invoiceLoading ? [] : invoiceData ? invoiceData : []}
        isLoading={invoiceLoading}
        action={
          <CustomButton
            onClick={() => {
              router.push(
                `/customers/88edfb3d-5402-4f8f-833f-0659d6dc60ff/invoices/new`,
              );
            }}
          >
            Create Invoice
          </CustomButton>
        }
        renderActions={(row) => (
          <div className="flex space-x-2">
            <CustomButton
              onClick={() => {
                clear();
                router.push(
                  `/customers/${row.customer_id}/invoices/${row.id}/edit/review`,
                );
              }}
            >
              Finish Invoice
            </CustomButton>
            {renderActions(row)}
          </div>
        )}
      />
    </>
  );
}
