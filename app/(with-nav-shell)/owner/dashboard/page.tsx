"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTransactions,
  getTransactionsMonthlySummary,
  Transaction,
  TransactionSummary,
} from "@/lib/api/transactions";
import { formatTime } from "@/lib/formatTime";
import formatDate from "@/lib/formatDate";
import {
  InventorySummary,
  ProductMonthlySummary,
  getInventorySummary,
  getProductSummary,
} from "@/lib/api/inventory";
import {
  ServiceMonthlySummary,
  getServicesMonthlySummary,
} from "@/lib/api/services";
export default function dashboard() {
  const [page, setPage] = useState(1);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const pageSize = 6;
  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["transactions", month],
    queryFn: () => getTransactions({ month: month }),
    enabled: !!month,
  });
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<TransactionSummary>({
    queryKey: ["transactionsSummary", month],
    queryFn: () => getTransactionsMonthlySummary(month),
    enabled: !!month,
  });
  const {
    data: summaryInventoryData,
    isLoading: summaryInventoryLoading,
    error: summaryInventoryError,
  } = useQuery<InventorySummary[]>({
    queryKey: ["inventorySummary", month],
    queryFn: () => getInventorySummary(),
  });

  const {
    data: summaryProductData,
    isLoading: summaryProductLoading,
    error: summaryProductError,
  } = useQuery<ProductMonthlySummary[]>({
    queryKey: ["productsSummary", month],
    queryFn: () => getProductSummary(month),
    enabled: !!month,
  });
  // const {
  //   data: summaryCustomerData,
  //   isLoading: summaryCustomerLoading,
  //   error: summaryCustomerError,
  // } = useQuery<CustomerMonthlySummary[]>({
  //   queryKey: ["customersSummary", month],
  //   queryFn: () => getCustomerMonthlySummary(month),
  //   enabled: !!month,
  // });
  const {
    data: summaryServiceData,
    isLoading: summaryServiceLoading,
    error: summaryServiceError,
  } = useQuery<ServiceMonthlySummary[]>({
    queryKey: ["servicesSummary", month],
    queryFn: () => getServicesMonthlySummary(month),
    enabled: !!month,
  });

  const monthlyTransactionStats = [
    {
      label: "Total Transactions",
      value: summaryData ? summaryData.total_transactions : 0,
      color: "text-primary-500",
    },
    {
      label: "Total Sales",
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
      label: "Debit Sales",
      value: summaryData ? summaryData.debit_sales_count : 0,
      subValue: `$${summaryData ? summaryData.debit_sales_amount : 0}`,
      color: "text-purple-400",
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
  const ServiceColumn: TableColumn<ServiceMonthlySummary>[] = [
    { header: "Service", accessor: "service" },
    { header: "Turn Over", accessor: "turn_over" },
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
  const ProductSummaryColumn: TableColumn<ProductMonthlySummary>[] = [
    { header: "Product", accessor: "name" },
    { header: "Turn Over", accessor: "turn_over" },
  ];
  if (error) return <p>Error {error.message}</p>;
  if (
    summaryError ||
    summaryServiceError ||
    summaryProductError ||
    summaryInventoryError
  )
    return <p>Error</p>;
  return (
    <>
      <div className=" ">
        <DataTable
          title="Stock Alert"
          columns={InventoryColumn}
          data={
            summaryInventoryLoading
              ? []
              : summaryInventoryData
                ? summaryInventoryData
                : []
          }
          isLoading={summaryInventoryLoading}
        />
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
        <div className=" grid grid-cols-1 md:grid-cols-2 ">
          <DataTable
            title="Most Selling Services"
            columns={ServiceColumn}
            data={
              summaryServiceLoading
                ? []
                : summaryServiceData
                  ? summaryServiceData
                  : []
            }
            isLoading={summaryServiceLoading}
          />
          <DataTable
            title="Most Selling Products"
            columns={ProductSummaryColumn}
            data={
              summaryProductLoading
                ? []
                : summaryProductData
                  ? summaryProductData
                  : []
            }
            isLoading={summaryProductLoading}
          />
        </div>
        <DataTable
          title="Transactions"
          columns={transactionColumns}
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
            total: data ? data.length : 1,
            onPageChange: setPage,
          }}
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
          //       setConfirmOpen(true);
          //     }}
          //     className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
          //   >
          //     <Trash size={16} />
          //   </button>
          // )}
        />
      </div>

      {/* <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        description="Do you want to Delete this transaction?"
        loading={confirmLoading}
      /> */}
    </>
  );
}
