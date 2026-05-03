"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Merge } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvoice, editInvoice, getInvoiceById } from "@/lib/api/invoices";
import { Transaction } from "@/lib/api/transactions";
import { Invoice } from "@/lib/api/customers";
import { useSession } from "next-auth/react";
import { InvoiceItem } from "@/stores/useInvoiceDraft";
import { getInventory } from "@/lib/api/inventory";

export default function EditInvoice({
  customer_Id,
  invoice_Id,
}: {
  customer_Id: string;
  invoice_Id: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");

  const { data, isLoading, error } = useQuery<Invoice>({
    queryKey: ["invoices", invoice_Id],
    queryFn: () => getInvoiceById(invoice_Id),
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => getInventory(),
  });
  const [transactions, setTransactions] = useState<Transaction[]>(
    data?.transactions || [],
  );
  useEffect(() => {
    if (data?.transactions) setTransactions(data.transactions);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (data: {
      total_amount?: number;
      subtotal: number;
      cash_amount?: number;
      debit_amount?: number;
      customer_id?: string;
      tax?: number;
      payment_method?: string;
      created_by: number;
      transactions: Transaction[];
      status: "pending" | "finished";
    }) => editInvoice(invoice_Id, data),
    onSuccess: () => {
      router.push(`/customers/${customer_Id}/invoices/${invoice_Id}`);
    },
    onError: (error: any) => {
      setAlertMessage(error.message || "An error occurred");
    },
  });
  // const transactions = data ? data?.transactions : [];

  const invoiceItemColumns: TableColumn<Transaction>[] = [
    { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category" },
    {
      header: "Product/Service",
      accessor: (item, index) => (
        <input
          type="text"
          value={
            item.category === "Tire" ? item.product_name : item.service_name
          }
          onChange={(e) => {
            // if (index === undefined) return;
            const newTransactions = [...transactions];
            if (item.category === "Tire") {
              newTransactions[index].product_name = e.target.value;
            } else {
              newTransactions[index].service_name = e.target.value;
            }
            setTransactions(newTransactions);
          }}
          className="border rounded px-1 py-0.5 text-sm w-full"
        />
      ),
    },
    {
      header: "Quantity (Tire)",
      accessor: (item, index) => (
        <input
          type="text"
          value={item.quantity}
          onChange={(e) => {
            if (index === undefined) return;
            const newTransactions = [...transactions];
            newTransactions[index].quantity = Number(e.target.value || "0");
            setTransactions(newTransactions);
          }}
          className="border rounded px-1 py-0.5 text-sm w-16"
        />
      ),
    },
    { header: "Amount", accessor: "amount" },
  ];
  const subTotal = transactions.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );
  const totalAmount = subTotal + (parseFloat(tax) || 0);
  useEffect(() => {
    if (paymentMethod === "Debit") {
      setTax((subTotal * 0.07).toFixed(2).toString());
      setDebitAmount((subTotal + subTotal * 0.07).toFixed(2).toString());
      setCashAmount("0");
    } else if (paymentMethod === "Cash") {
      setTax("0");
      setCashAmount(totalAmount.toString());
      setDebitAmount("0");
    } else if (paymentMethod === "Mix") {
      const calculatedTax = (subTotal * 0.07).toFixed(2);
      setTax(calculatedTax.toString());
      setDebitAmount(((subTotal + parseFloat(calculatedTax)) / 2).toString());
      setCashAmount(
        (
          subTotal +
          parseFloat(calculatedTax) -
          (subTotal + parseFloat(calculatedTax)) / 2
        ).toString(),
      );
    } else {
      setTax("0");
      setCashAmount("0");
      setDebitAmount("0");
    }
  }, [paymentMethod, subTotal]);

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
      tax: parseFloat(tax) || 0,
      cash_amount: parseFloat(cashAmount) || 0,
      debit_amount: parseFloat(debitAmount) || 0,
      customer_id: customer_Id,
      payment_method: paymentMethod,
      created_by: session?.user?.id || 10,
      transactions: transactions,
      status: "finished",
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
                      (totalAmount - parseFloat(e.target.value || "0"))
                        .toFixed(2)
                        .toString(),
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
                  onChange={(e) => {
                    setDebitAmount(e.target.value);
                    setCashAmount(
                      (totalAmount - parseFloat(e.target.value || "0"))
                        .toFixed(2)
                        .toString(),
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
