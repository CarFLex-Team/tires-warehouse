"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { redirect, useRouter } from "next/navigation";
import { useInvoiceDraft } from "@/stores/useInvoiceDraft";
import { Banknote, CreditCard } from "lucide-react";
import { useState } from "react";

export default function review() {
  const router = useRouter();
  const { items, customerId } = useInvoiceDraft();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const clear = useInvoiceDraft((s) => s.clear);
  console.log("Items in review page:", paymentMethod);
  type Item = {
    id: string;
    category: string;
    description: string;
    amount: string;
  };

  const customerColumns: TableColumn<Item>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
  ];
  const subTotal = items.reduce(
    (total, item) => total + parseFloat(item.amount),
    0
  );
  const tax = Math.floor(subTotal * 0.1);
  const totalAmount = subTotal + tax;
  function saveInvoice() {
    if (!paymentMethod) {
      setAlertMessage("Please select a payment method");
      return;
    }
    // clear();
    router.push(`/customers/${customerId}/invoices`);
  }
  if (!items.length || !customerId) {
    redirect(`/customers`);
  }
  return (
    <div className="flex flex-col sm:flex-row  ">
      <div className="flex-3">
        <DataTable title="Review" columns={customerColumns} data={items} />
      </div>
      <div className="relative rounded-xl bg-white p-5 m-4 shadow-sm min-h-full flex-1 ">
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">Payment Method</p>
          <div className="flex gap-2">
            <button
              className={`flex items-center gap-1.5 rounded border border-primary-600  px-2 py-1 text-sm  cursor-pointer m-1  ${
                paymentMethod === "cash"
                  ? "bg-primary-600 text-white"
                  : "bg-white  text-primary-600 hover:bg-gray-100"
              }`}
              onClick={() => {
                setAlertMessage("");
                setPaymentMethod("cash");
              }}
            >
              <Banknote /> Cash
            </button>
            <button
              className={`flex items-center gap-1.5 rounded border border-primary-600  px-2 py-1 text-sm cursor-pointer m-1  ${
                paymentMethod === "debit"
                  ? "bg-primary-600 text-white"
                  : "bg-white  text-primary-600 hover:bg-gray-100"
              }`}
              onClick={() => {
                setAlertMessage("");
                setPaymentMethod("debit");
              }}
            >
              <CreditCard /> Debit
            </button>
          </div>
          <p className="text-red-500">{alertMessage}</p>
        </div>
        <div className="my-6 border-t" />
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">Amount Breakdown</p>
          <p className="text-sm text-gray-500">
            SubTotal: ${subTotal.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Tax(10%): ${tax.toFixed(2)}</p>
          <p className="text-sm text-gray-500">
            Total: ${totalAmount.toFixed(2)}
          </p>
          <CustomButton className="mt-4 w-full" onClick={saveInvoice}>
            Save Invoice
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
