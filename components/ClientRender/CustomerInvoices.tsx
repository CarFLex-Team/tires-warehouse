"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { InfoCard } from "@/components/ui/InfoCard";
import { useState } from "react";
import CustomButton from "../ui/CustomButton";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";
import {
  Customer,
  getCustomerById,
  getCustomerInvoices,
  Invoice,
} from "@/lib/api/customers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import formatDate from "@/lib/formatDate";
import { formatTime } from "@/lib/formatTime";
import { deleteInvoice, getInvoiceById } from "@/lib/api/invoices";
import { Transaction } from "@/lib/api/transactions";

export default function CustomerInvoices({
  isOwner = false,
  customerId,
}: {
  isOwner?: boolean;
  customerId?: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Transaction[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Customer>({
    queryKey: ["customers", customerId],
    queryFn: () => getCustomerInvoices(customerId || ""),
  });
  const customer = data;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });

  if (error) return <p>Error {error.message}</p>;
  async function getItems(invoiceId: string) {
    setModalLoading(true);
    const invoice = await getInvoiceById(invoiceId);
    const invoiceItems = invoice.transactions.filter((item) => {
      if (item.product_name) {
        return item;
      }
    });
    setItems(invoiceItems);
    setModalLoading(false);
  }
  const InvoiceColumns: TableColumn<Invoice>[] = [
    { header: "Invoice ID", accessor: "invoice_no" },
    {
      header: "Created At",
      accessor: (row) => (
        <div>
          <div>{formatDate(row.created_at)}</div>
          <div className="text-xs text-gray-400">
            at {formatTime(row.created_at)}
          </div>
        </div>
      ),
    },
    {
      header: "Total Amount",
      accessor: (row) => `$${row.total_amount ?? row.subtotal}`,
    },
    {
      header: "SubTotal",
      accessor: (row) => `$${row.subtotal}`,
    },
    // {
    //   header: "Tax",
    //   accessor: (row) => `$${row.tax ?? 0}`,
    // },
    {
      header: "Status",
      accessor: (row) => <p className="capitalize">{row.status}</p>,
    },
    // { header: "Payment Method", accessor: "payment_method" },

    { header: "Created By", accessor: "created_by" },
  ];
  const actionColumn = !isOwner
    ? (invoice: Invoice) => (
        <div className="flex gap-2 justify-center">
          {invoice.status !== "finished" && (
            <CustomButton
              onClick={() =>
                router.push(
                  `/customers/${customerId}/invoices/${invoice.id}/edit/review`,
                )
              }
            >
              Finish Invoice
            </CustomButton>
          )}
          <button
            className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={async (e) => {
              e.stopPropagation();
              setSelectedId(invoice.id);
              setConfirmOpen(true);
              await getItems(invoice.id);
            }}
          >
            <Trash size={16} />
          </button>
        </div>
      )
    : undefined;

  return (
    <>
      <InfoCard
        title={customer?.name || "Name not available"}
        subtitle={customer?.email || "Email not available"}
        meta={`Created at ${customer ? formatDate(customer?.created_at) : "Date not available"}`}
        isLoading={isLoading}
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
        onRowClick={(invoice) =>
          invoice.status === "finished" && router.push(`invoices/${invoice.id}`)
        }
        pagination={{
          page,
          pageSize,
          total: customer?.invoices.length || 0,
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
        onConfirm={() => {
          if (selectedId) {
            deleteMutation.mutate(selectedId);
          }
        }}
        extraBody={
          <div>
            {items.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                These Items will be returned to inventory:
              </p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="border px-2 rounded my-2 flex justify-between "
              >
                <p className="flex-2 p-2">{item.product_name}</p>
                <p className="border border-gray-600"></p>

                <p className="flex-1 p-2 text-center ">
                  Quantity: {item.quantity}
                </p>
              </div>
            ))}
          </div>
        }
        description="Do you want to Delete this invoice?"
        loading={deleteMutation.isPending || modalLoading}
        error={deleteMutation.error?.message}
      />
    </>
  );
}
