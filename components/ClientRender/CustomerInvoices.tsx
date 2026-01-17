"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { InfoCard } from "@/components/ui/InfoCard";
import { useState } from "react";
import CustomButton from "../ui/CustomButton";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Customer, getCustomerById, Invoice } from "@/lib/api/customers";
import { useQuery } from "@tanstack/react-query";
import formatDate from "@/lib/formatDate";
export default function CustomerInvoices({
  customer2,
  isOwner,
  customerId,
}: {
  customer2?: any;
  isOwner?: boolean;
  customerId?: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery<Customer>({
    queryKey: ["customers", customerId],
    queryFn: () => getCustomerById(customerId || ""),
    select: (customer) => ({
      ...customer,
      created_at: formatDate(customer.created_at),
    }),
  });
  const customer = data;
  if (error) return <p>Error {error.message}</p>;
  const InvoiceColumns: TableColumn<Invoice>[] = [
    { header: "Invoice ID", accessor: "id" },
    { header: "Date", accessor: "created_at" },
    { header: "Amount", accessor: "total_amount" },
    { header: "Payment Method", accessor: "payment_method" },
    { header: "Created By", accessor: "created_by" },
  ];
  const actionColumn = !isOwner
    ? (invoice: Invoice) => (
        <button
          className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          <Trash size={16} />
        </button>
      )
    : undefined;
  return (
    <>
      <InfoCard
        title={customer?.name || "Name not available"}
        subtitle={customer?.email || "Email not available"}
        meta={`Created at ${customer?.created_at || "Date not available"}`}
      />
      <DataTable
        title="Invoices"
        columns={InvoiceColumns}
        data={
          isLoading
            ? []
            : customer?.invoices.slice(
                (page - 1) * pageSize,
                page * pageSize,
              ) || []
        }
        isLoading={isLoading}
        onRowClick={(invoice) => router.push(`invoices/${invoice.id}`)}
        pagination={{
          page,
          pageSize,
          total: customer?.invoices.length || 1,
          onPageChange: setPage,
        }}
        action={
          !isOwner && (
            <CustomButton
              onClick={() => {
                router.push(`/customers/${customer?.id}/invoices/new`);
              }}
            >
              Add Invoice
            </CustomButton>
          )
        }
        renderActions={actionColumn}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        description="Do you want to Delete this invoice?"
        loading={confirmLoading}
      />
    </>
  );
}
