"use client";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import customers from "@/data/customers.json";
export default function CreateInvoice() {
  const customer = customers.find((c) => c.id === Number(1));
  const transactions = customer ? customer.invoices[0].transactions : [];
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  type Transaction = {
    category: string;
    description: string;
    amount: number;
  };

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
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
              name="transactionType"
              id="transactionType"
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
              name="transactionType"
              id="transactionType"
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
        <DataTable
          title={`Invoice #${customer?.invoices[0].id}`}
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
        />
      </div>
    </>
  );
}
