"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { redirect, useRouter } from "next/navigation";
import { InvoiceItem, useInvoiceDraft } from "@/stores/useInvoiceDraft";
import { Banknote, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvoice } from "@/lib/api/invoices";

export default function ReviewNewInvoice({
  customer_Id,
}: {
  customer_Id: string;
}) {
  const router = useRouter();
  const { items, customerId } = useInvoiceDraft();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const clear = useInvoiceDraft((s) => s.clear);
  useEffect(() => {
    if (!items.length) {
      router.push(`/customers/${customer_Id}/invoices`);
    }
    if (customerId && customerId !== customer_Id) {
      clear();
      router.replace("/customers");
    }
  }, [items.length, customerId, router, customer_Id]);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      clear();
      router.push(`/customers/${customer_Id}/invoices`);
    },
  });

  const invoiceItemColumns: TableColumn<InvoiceItem>[] = [
    { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category_name" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
  ];
  const subTotal = items.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );
  const tax = paymentMethod === "Debit" ? Math.floor(subTotal * 0.07) : 0;
  const totalAmount = subTotal + tax;

  function saveInvoice() {
    if (!paymentMethod) {
      setAlertMessage("Please select a payment method");
      return;
    }
    if (!customerId) {
      return;
    }
    mutation.mutate({
      total: totalAmount,
      subtotal: subTotal,
      tax,
      customer_id: customerId,
      payment_method: paymentMethod,
      transactions: items,
    });
  }

  return (
    <div className="flex flex-col sm:flex-row  ">
      <div className="flex-3">
        <DataTable title="Review" columns={invoiceItemColumns} data={items} />
      </div>
      <div className="relative rounded-xl bg-white p-5 m-4 shadow-sm min-h-full flex-1 ">
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">Payment Method</p>
          <div className="flex gap-2">
            <button
              className={`flex items-center gap-1.5 rounded border border-primary-600  px-2 py-1 text-sm  cursor-pointer m-1  ${
                paymentMethod === "Cash"
                  ? "bg-primary-600 text-white"
                  : "bg-white  text-primary-600 hover:bg-gray-100"
              }`}
              onClick={() => {
                setAlertMessage("");
                setPaymentMethod("Cash");
              }}
            >
              <Banknote /> Cash
            </button>
            <button
              className={`flex items-center gap-1.5 rounded border border-primary-600  px-2 py-1 text-sm cursor-pointer m-1  ${
                paymentMethod === "Debit"
                  ? "bg-primary-600 text-white"
                  : "bg-white  text-primary-600 hover:bg-gray-100"
              }`}
              onClick={() => {
                setAlertMessage("");
                setPaymentMethod("Debit");
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
          {paymentMethod === "Debit" && (
            <p className="text-sm text-gray-500">
              SubTotal: ${subTotal.toFixed(2)}
            </p>
          )}
          {paymentMethod === "Debit" && (
            <p className="text-sm text-gray-500">Tax(10%): ${tax.toFixed(2)}</p>
          )}
          <p className="text-sm text-gray-500">
            Total: ${totalAmount.toFixed(2)}
          </p>
          <CustomButton
            className="mt-4 w-full"
            onClick={saveInvoice}
            isLoading={mutation.isPending}
          >
            Save Invoice
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
