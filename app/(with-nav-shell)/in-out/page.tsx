"use client";

import Invoices from "@/components/ClientRender/Invoices";
import InvoicesInTime from "@/components/ClientRender/InvoicesInTime";
import Payout from "@/components/ClientRender/Payout";
import StockAlert from "@/components/ClientRender/StockAlert";
import CustomButton from "@/components/ui/CustomButton";
import { Invoice } from "@/lib/api/customers";
import { deleteInvoice, getInvoiceById } from "@/lib/api/invoices";
import { Transaction } from "@/lib/api/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";

import { useState } from "react";

export default function payOuts() {
  const [currentTab, setCurrentTab] = useState("payouts");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Transaction[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const queryClient = useQueryClient();
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
  if (error)
    return (
      <p className="text-red-500 text-center">
        Error {error || "An error occurred"}
      </p>
    );
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
  return (
    <>
      <div className="m-4 flex justify-center">
        <CustomButton
          onClick={() => setCurrentTab("payouts")}
          isSelector={true}
          className={` border border-primary-600 ${currentTab === "payouts" ? "bg-primary-600 text-white " : "bg-gray-100 text-primary-600  "}`}
        >
          Payouts
        </CustomButton>
        <CustomButton
          onClick={() => setCurrentTab("invoices")}
          isSelector={true}
          className={` border border-primary-600 ${currentTab === "invoices" ? "bg-primary-600 text-white " : "bg-gray-100 text-primary-600  "}`}
        >
          Invoices
        </CustomButton>
      </div>
      {currentTab === "payouts" ? (
        <Payout setError={setError} />
      ) : (
        <Invoices
          month={month}
          renderActions={actionColumn}
          setError={setError}
          actions={
            <input
              type="month"
              max={currentMonth}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          }
        />
      )}
    </>
  );
}
