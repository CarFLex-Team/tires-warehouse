"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import transactions from "../../../data/transactions.json";
import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function dashboard() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);
  const dailyTransactionStats = [
    {
      label: "Total Transactions",
      value: 7,
      color: "text-primary-500",
    },
    {
      label: "Total Sales",
      value: 6,
      subValue: "$2500",
      color: "text-orange-400",
    },
    {
      label: "Cash Sales",
      value: 1,
      subValue: "$500",
      color: "text-red-400",
    },
    {
      label: "Debit Sales",
      value: 5,
      subValue: "$2000",
      color: "text-purple-400",
    },
  ];
  type Transaction = {
    category: string;
    description: string;
    type: string;
    amount: number;
    paymentMethod: string;
    date: string;
    time: string;
    createdBy: string;
  };

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Payment Method", accessor: "paymentMethod" },
    {
      header: "Date",
      accessor: (row) => (
        <div>
          <div>{row.date}</div>
          <div className="text-xs text-gray-400">at {row.time}</div>
        </div>
      ),
    },
    { header: "Created by", accessor: "createdBy" },
  ];

  return (
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Transaction"
          buttonText="Add Transaction"
        >
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Category</label>
            <select
              name="category"
              id="category"
              className="p-2 border border-gray-300 rounded-lg flex-5 text-gray-700"
              defaultValue=""
            >
              <option disabled value="">
                Category
              </option>
              <option value="tires">Tires</option>
              <option value="batteryFix">Battery Fix</option>
            </select>
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className="flex-2">Description</label>
            <textarea
              rows={2}
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Transaction Description"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Type</label>
            <select
              name="transactionType"
              id="transactionType"
              className="p-2 border border-gray-300 rounded-lg flex-5 text-gray-700"
              defaultValue=""
            >
              <option disabled value="">
                Transaction Type
              </option>
              <option value="sale">Sales</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Amount</label>
            <input
              type="number"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Price Amount"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Method</label>
            <select
              name="paymentMethod"
              id="paymentMethod"
              className="p-2 border border-gray-300 rounded-lg flex-5 text-gray-700"
              defaultValue=""
            >
              <option disabled value="">
                Payment Method
              </option>
              <option value="cash">Cash</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </Modal>
      )}
      <div className=" ">
        <OverviewStats title="Daily Overview" stats={dailyTransactionStats} />
        <DataTable
          title="Transactions"
          columns={transactionColumns}
          data={
            isLoading
              ? []
              : transactions.slice((page - 1) * pageSize, page * pageSize)
          }
          isLoading={isLoading}
          pagination={{
            page,
            pageSize,
            total: transactions.length,
            onPageChange: setPage,
          }}
          action={
            <CustomButton
              onClick={() => {
                setOpen(true);
              }}
            >
              Add Transaction
            </CustomButton>
          }
          renderActions={(row) => (
            <button
              onClick={() => {
                setConfirmOpen(true);
              }}
              className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Trash size={16} />
            </button>
          )}
        />
      </div>
      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        description="Do you want to Delete this transaction?"
        loading={confirmLoading}
      />
    </>
  );
}
