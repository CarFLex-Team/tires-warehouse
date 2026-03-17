"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvoice, editInvoice, getInvoiceById } from "@/lib/api/invoices";
import { Transaction } from "@/lib/api/transactions";
import { Invoice } from "@/lib/api/customers";

export default function EditInvoice({
  customer_Id,
  invoice_Id,
}: {
  customer_Id: string;
  invoice_Id: string;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const { data, isLoading, error } = useQuery<Invoice>({
    queryKey: ["invoices", invoice_Id],
    queryFn: () => getInvoiceById(invoice_Id),
  });
  const mutation = useMutation({
    mutationFn: (data: {
      total_amount?: number;
      subtotal: number;
      tax?: number;
      payment_method?: string;
    }) => editInvoice(invoice_Id, data),
    onSuccess: () => {
      router.push(`/customers/${customer_Id}/invoices/${invoice_Id}`);
    },
  });
  const transactions = data ? data?.transactions : [];

  const invoiceItemColumns: TableColumn<Transaction>[] = [
    { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category" },
    {
      header: "Product/Service",
      accessor: (item) =>
        item.category === "Tire" ? item.product_name : item.service_name,
    },
    { header: "Quantity (Tire)", accessor: "quantity" },
    // { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount" },
  ];
  const subTotal = transactions.reduce(
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
    if (!customer_Id) {
      return;
    }

    mutation.mutate({
      total_amount: totalAmount,
      subtotal: subTotal,
      tax,
      payment_method: paymentMethod,
    });
  }

  return (
    <div className="flex flex-col sm:flex-row  ">
      <div className="flex-3">
        <DataTable
          title="Finishing Invoice"
          columns={invoiceItemColumns}
          isLoading={isLoading}
          data={transactions}
        />
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
            Finish Invoice
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
