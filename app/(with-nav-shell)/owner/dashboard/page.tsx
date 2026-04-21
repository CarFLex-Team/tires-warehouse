"use client";
import { OverviewStats } from "@/components/overview/Overview-stats";
import { useState } from "react";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@/lib/api/transactions";
import { Invoice } from "@/lib/api/customers";
import {
  deleteInvoice,
  getInvoiceById,
  getInvoiceSummary,
  InvoiceSummary,
} from "@/lib/api/invoices";
import PendingInvoices from "@/components/ClientRender/PendingInvoices";
import StockAlert from "@/components/ClientRender/StockAlert";
import InvoicesInTime from "@/components/ClientRender/InvoicesInTime";
export default function dashboard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Transaction[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<InvoiceSummary>({
    queryKey: ["invoiceSummary", month],
    queryFn: () => getInvoiceSummary(month),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceSummary", month] });
      queryClient.invalidateQueries({ queryKey: ["invoices", month] });
      queryClient.invalidateQueries({ queryKey: ["invoices", "pending"] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });
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
  const monthlyTransactionStats = [
    {
      label: "Total Transactions",
      value: summaryData ? summaryData.total_transactions : 0,
      color: "text-primary-500",
    },
    {
      label: "Total Sales (with Tax)",
      value: summaryData ? summaryData.total_sales_count : 0,
      subValue: `$${summaryData ? summaryData.total_sales_amount : 0}`,
      color: "text-orange-400",
    },
    {
      label: "Cash Sales",
      value: summaryData ? summaryData.cash_sales_count : 0,
      subValue: `$${summaryData ? summaryData.cash_sales_amount : 0}`,
      color: "text-red-400",
    },
    {
      label: "Debit Sales (with Tax)",
      value: summaryData ? summaryData.debit_sales_count : 0,
      subValue: `$${summaryData ? summaryData.debit_sales_amount : 0}`,
      color: "text-purple-400",
    },
  ];

  const actionColumn = (invoice: Invoice) => (
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
  );

  if (error || summaryError)
    return (
      <p className="text-red-500 text-center">
        Error {error || summaryError?.message || "An error occurred"}
      </p>
    );
  return (
    <>
      <div className=" ">
        <PendingInvoices renderActions={actionColumn} setError={setError} />
        <StockAlert setError={setError} />
        <OverviewStats
          title="Monthly Overview"
          stats={monthlyTransactionStats}
          isLoading={summaryLoading}
          action={
            <input
              type="month"
              max={currentMonth}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          }
        />
        <InvoicesInTime
          month={month}
          renderActions={actionColumn}
          setError={setError}
        />
      </div>
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
      />
    </>
  );
}
