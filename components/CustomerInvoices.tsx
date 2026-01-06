"use client";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import { InfoCard } from "@/components/ui/InfoCard";
import { useState, useEffect } from "react";
import CustomButton from "./ui/CustomButton";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
export default function CustomerInvoices({ customer }: { customer: any }) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);
  type Invoice = {
    id: number;
    createdAt: string;
    amount: string;
    createdBy: string;
    paymentMethod: string;
  };

  const InvoiceColumns: TableColumn<Invoice>[] = [
    { header: "Invoice ID", accessor: "id" },
    { header: "Date", accessor: "createdAt" },
    { header: "Amount", accessor: "amount" },
    { header: "Payment Method", accessor: "paymentMethod" },
    { header: "Created By", accessor: "createdBy" },
  ];

  return (
    <>
      <InfoCard
        title={customer?.name || "Name not available"}
        subtitle={customer?.email || "Email not available"}
        meta={`Created at ${customer?.createdAt || "Date not available"}`}
      />
      <DataTable
        title="Invoices"
        columns={InvoiceColumns}
        data={
          isLoading
            ? []
            : customer.invoices.slice((page - 1) * pageSize, page * pageSize)
        }
        isLoading={isLoading}
        onRowClick={(invoice) =>
          router.push(`/customers/${customer.id}/invoices/${invoice.id}`)
        }
        pagination={{
          page,
          pageSize,
          total: customer.invoices.length,
          onPageChange: setPage,
        }}
        action={
          <CustomButton
            onClick={() => {
              router.push(`/customers/${customer.id}/create-invoice`);
            }}
          >
            Add Invoice
          </CustomButton>
        }
        renderActions={(row) => (
          <button
            className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash size={16} />
          </button>
        )}
      />
    </>
  );
}
