import { useQuery } from "@tanstack/react-query";
import invoiceColumns from "../columns/InvoiceColumn";
import { DataTable } from "../Tables/DataTable";
import { getInvoices } from "@/lib/api/invoices";
import { Invoice } from "@/lib/api/customers";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [page, setPage] = useState(1);
  const pageSize = 6;
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
      data={
        isLoading
          ? []
          : data
            ? data.slice((page - 1) * pageSize, page * pageSize)
            : []
      }
      isLoading={isLoading}
      pagination={{
        page,
        pageSize,
        total: data?.length || 0,
        onPageChange: setPage,
      }}
      onRowClick={(invoice) =>
        invoice.status === "finished" &&
        router.push(`customers/${invoice.customer_id}/invoices/${invoice.id}`)
      }
      renderActions={renderActions}
    />
  );
}
