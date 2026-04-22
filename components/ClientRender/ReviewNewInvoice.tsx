"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { redirect, useRouter } from "next/navigation";
import { InvoiceItem, useInvoiceDraft } from "@/stores/useInvoiceDraft";
import { Banknote, CreditCard, Merge } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvoice } from "@/lib/api/invoices";
import { useSession } from "next-auth/react";

export default function ReviewNewInvoice({
  customer_Id,
}: {
  customer_Id: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, customerId } = useInvoiceDraft();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
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
    onError: (error: any) => {
      setAlertMessage(error.message || "An error occurred");
    },
  });

  const invoiceItemColumns: TableColumn<InvoiceItem>[] = [
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
    { header: "Cost", accessor: "cost" },
  ];
  const subTotal = items.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );
  useEffect(() => {
    if (paymentMethod === "Debit") {
      setTax((subTotal * 0.07).toString());
      setDebitAmount((subTotal + subTotal * 0.07).toString());
      setCashAmount("0");
    } else if (paymentMethod === "Cash") {
      setTax("0");
      setCashAmount(totalAmount.toString());
      setDebitAmount("0");
    } else if (paymentMethod === "Mix") {
      const calculatedTax = subTotal * 0.07;
      setTax(calculatedTax.toString());
      setDebitAmount(((subTotal + calculatedTax) / 2).toString());
      setCashAmount(
        (subTotal + calculatedTax - (subTotal + calculatedTax) / 2).toString(),
      );
    } else {
      setTax("0");
      setCashAmount("0");
      setDebitAmount("0");
    }
  }, [paymentMethod, subTotal]);

  const totalAmount = subTotal + parseFloat(tax || "0");

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
      cash_amount: parseFloat(cashAmount) || 0,
      debit_amount: parseFloat(debitAmount) || 0,
      subtotal: subTotal,
      tax: parseFloat(tax || "0"),
      customer_id: customerId,
      status: "finished",
      payment_method: paymentMethod,
      transactions: items,
      created_by: session?.user?.id || 10,
    });
  }
  function saveInvoiceAsPending() {
    if (!customerId) {
      return;
    }
    mutation.mutate({
      subtotal: subTotal,
      customer_id: customerId,
      status: "pending",
      transactions: items,
      created_by: session?.user?.id || 10,
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
            <button
              className={`flex items-center gap-1.5 rounded border border-primary-600  px-2 py-1 text-sm cursor-pointer m-1  ${
                paymentMethod === "Mix"
                  ? "bg-primary-600 text-white"
                  : "bg-white  text-primary-600 hover:bg-gray-100"
              }`}
              onClick={() => {
                setAlertMessage("");
                setPaymentMethod("Mix");
              }}
            >
              <Merge /> Mix
            </button>
          </div>
          <p className="text-red-500">{alertMessage}</p>
        </div>
        <div className="my-6 border-t" />
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">Amount Breakdown</p>
          {paymentMethod === "Debit" || paymentMethod === "Mix" ? (
            <p className="text-sm text-gray-500">
              SubTotal: ${subTotal.toFixed(2)}
            </p>
          ) : null}
          {paymentMethod === "Debit" || paymentMethod === "Mix" ? (
            <p className="text-sm text-gray-500">
              Tax(7%): $
              <input
                type="text"
                value={tax}
                onChange={(e) => {
                  const val = e.target.value;
                  setTax(val);
                  const numericVal = parseFloat(val) || 0;

                  // Use toFixed(2) to round to 2 decimals
                  const cash = Math.floor((subTotal + numericVal) / 2);
                  const debit = (subTotal + numericVal - cash).toFixed(2);

                  setCashAmount(cash.toString());
                  setDebitAmount(debit);
                }}
                className=" w-9 rounded border border-gray-300 px-1 py-0.5  text-sm"
              />
            </p>
          ) : null}
          {paymentMethod === "Mix" && (
            <>
              <p className="text-sm text-gray-500">
                Cash: $
                <input
                  type="text"
                  value={cashAmount}
                  onChange={(e) => {
                    setCashAmount(e.target.value);
                    setDebitAmount(
                      (
                        totalAmount - parseFloat(e.target.value || "0")
                      ).toString(),
                    );
                  }}
                  className=" w-9 rounded border border-gray-300 px-1 py-0.5  text-sm"
                />
              </p>
              <p className="text-sm text-gray-500">
                Debit: $
                <input
                  type="text"
                  value={debitAmount}
                  max={totalAmount}
                  min={0}
                  onChange={(e) => {
                    setDebitAmount(e.target.value);
                    setCashAmount(
                      (
                        totalAmount - parseFloat(e.target.value || "0")
                      ).toString(),
                    );
                  }}
                  className=" w-9 rounded border border-gray-300 px-1 py-0.5  text-sm"
                />
              </p>
            </>
          )}
          <p className="text-sm text-gray-500">
            Total: ${totalAmount.toFixed(2)}
          </p>
          <CustomButton
            className="mt-4 w-full"
            onClick={saveInvoiceAsPending}
            isLoading={mutation.isPending}
          >
            Save Invoice as Pending
          </CustomButton>
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
