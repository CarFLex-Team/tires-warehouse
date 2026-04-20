"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import CustomButton from "@/components/ui/CustomButton";
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AddTransactionForm } from "@/components/Forms/addTransactionForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteTransaction,
  getTransactions,
  getTransactionsDailySummary,
  Transaction,
  TransactionSummary,
} from "@/lib/api/transactions";
import formatDate from "@/lib/formatDate";
import { formatTime } from "@/lib/formatTime";
import { Invoice } from "@/lib/api/customers";
import { getInventorySummary, InventorySummary } from "@/lib/api/inventory";
import {
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  getInvoiceSummary,
  InvoiceSummary,
} from "@/lib/api/invoices";
import { useRouter } from "next/navigation";
export default function dashboard() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Transaction[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const pageSize = 6;

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ["invoices", date],
    queryFn: () => getInvoices("finished", undefined, date),
  });
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<InvoiceSummary>({
    queryKey: ["invoiceSummary", date],
    queryFn: () => getInvoiceSummary(date),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceSummary", date] });
      queryClient.invalidateQueries({ queryKey: ["invoices", date] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });
  const {
    data: summaryInventoryData,
    isLoading: summaryInventoryLoading,
    error: summaryInventoryError,
  } = useQuery<InventorySummary[]>({
    queryKey: ["inventorySummary"],
    queryFn: () => getInventorySummary(),
  });
  const {
    data: invoiceData,
    isLoading: invoiceLoading,
    error: invoiceError,
  } = useQuery<Invoice[]>({
    queryKey: ["invoices", "pending"],
    queryFn: () => getInvoices("pending"),
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
  const dailyInvoiceStats = [
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
  const InventoryColumn: TableColumn<InventorySummary>[] = [
    { header: "Product", accessor: "name" },
    { header: "Quantity (Tire)", accessor: "quantity" },
    {
      header: "Status",
      accessor: (row) =>
        row.quantity <= 0 ? (
          <p className="bg-red-300 text-center px-2 py-1 rounded">
            Out of Stock
          </p>
        ) : row.quantity <= 4 ? (
          <p className="bg-yellow-300 text-center px-2 py-1 rounded">
            Low Stock
          </p>
        ) : (
          <p className="bg-green-300 text-center px-2 py-1 rounded">In Stock</p>
        ),
    },
  ];
  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category" },
    {
      header: "Product/Service",
      accessor: (row) =>
        row.category === "Tire" ? row.product_name : row.service_name,
    },
    // { header: "Description", accessor: "description" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Amount", accessor: "amount" },
    { header: "Payment Method", accessor: "payment_method" },

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
    { header: "Created by", accessor: "created_by_name" },
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

  const invoiceColumns: TableColumn<Invoice>[] = [
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
      header: "Customer",
      accessor: (row) => (
        <div>
          <div>
            <span className="font-medium">Name:</span> {row.customer_name}
          </div>
          <div className="text-xs text-gray-400">
            <span className="font-medium">Phone:</span> {row.customer_phone}
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

    { header: "Created By", accessor: "created_by_name" },
  ];
  if (error) return <p>Error {error.message}</p>;
  if (summaryError) return <p>Error {summaryError.message}</p>;
  return (
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Transaction"
        >
          <AddTransactionForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      <div className=" ">
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
            <CustomButton
              onClick={() => {
                router.push(
                  `/customers/${row.customer_id}/invoices/${row.id}/edit`,
                );
              }}
            >
              Finish Invoice
            </CustomButton>
          )}
        />
        <DataTable
          title="Stock Alert"
          columns={InventoryColumn}
          data={
            summaryInventoryLoading
              ? []
              : summaryInventoryData
                ? summaryInventoryData.slice(
                    (stockPage - 1) * pageSize,
                    stockPage * pageSize,
                  )
                : []
          }
          isLoading={summaryInventoryLoading}
          pagination={{
            page: stockPage,
            pageSize,
            total: summaryInventoryData?.length || 0,
            onPageChange: setStockPage,
          }}
        />
        <OverviewStats
          title="Daily Overview"
          stats={dailyInvoiceStats}
          isLoading={summaryLoading}
          action={
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          }
        />
        {/* <DataTable
          title="Most Spending Customers"
          columns={CustomerColumn}
          data={
            summaryCustomerLoading
              ? []
              : summaryCustomerData
                ? summaryCustomerData
                : []
          }
          isLoading={summaryCustomerLoading}
        /> */}

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
            router.push(
              `customers/${invoice.customer_id}/invoices/${invoice.id}`,
            )
          }
          // action={
          //   <CustomButton
          //     onClick={() => {
          //       setOpen(true);
          //     }}
          //   >
          //     Add Transaction
          //   </CustomButton>
          // }
          // renderActions={(row) => (
          //   <button
          //     onClick={() => {
          //       setSelectedId(row.id);
          //       setConfirmOpen(true);
          //     }}
          //     className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
          //   >
          //     <Trash size={16} />
          //   </button>
          // )}
          renderActions={actionColumn}
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
