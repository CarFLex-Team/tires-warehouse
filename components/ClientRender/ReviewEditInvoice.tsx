"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Merge, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvoice, editInvoice, getInvoiceById } from "@/lib/api/invoices";
import { Transaction } from "@/lib/api/transactions";
import { Invoice } from "@/lib/api/customers";
import { useSession } from "next-auth/react";
import { useInvoiceDraft } from "@/stores/useInvoiceDraft";
import InvoiceCalcSections from "./InvoiceCalcSections";
export default function ReviewEditInvoice({
  customer_Id,
  invoice_Id,
}: {
  customer_Id: string;
  invoice_Id: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { items: savedItems, customerId } = useInvoiceDraft();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [checkAmount, setCheckAmount] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const clear = useInvoiceDraft((s) => s.clear);
  const [items, setItems] = useState<Transaction[]>([]);
  const { data, isLoading, error } = useQuery<Invoice>({
    queryKey: ["invoices", invoice_Id],
    queryFn: () => getInvoiceById(invoice_Id),
  });

  useEffect(() => {
    if (!savedItems.length && data?.transactions) {
      setItems(data.transactions);
    } else {
      setItems(savedItems);
    }
    if (customerId && customerId !== customer_Id) {
      clear();
      router.replace("/customers");
    }
    if (data?.down_amount !== undefined) {
      setDownPayment(String(data.down_amount));
    }
  }, [savedItems.length, customerId, router, customer_Id, data]);
  const mutation = useMutation({
    mutationFn: (data: {
      total_amount?: number;
      subtotal: number;
      cash_amount?: number;
      debit_amount?: number;
      check_amount?: number;
      customer_id?: string;
      tax?: number;
      payment_method?: string;
      created_by: number;
      transactions: Transaction[];
      status: "pending" | "finished";
    }) => editInvoice(invoice_Id, data),
    onSuccess: () => {
      clear();
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
      accessor: (item) =>
        item.category === "Tire" ? item.product_name : item.service_name,
    },
    { header: "Quantity (Tire)", accessor: "quantity" },
    { header: "Amount", accessor: "amount" },
  ];
  const subTotal = items.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );
  const totalAmount = subTotal + (parseFloat(tax) || 0);

  function saveInvoice() {
    if (!paymentMethod) {
      setAlertMessage("Please select a payment method");
      return;
    }
    if (
      parseFloat(cashAmount || "0") +
        parseFloat(debitAmount || "0") +
        parseFloat(checkAmount || "0") !==
      totalAmount
    ) {
      setAlertMessage("Amount added not equal the total amount");
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
      check_amount: parseFloat(checkAmount) || 0,
      customer_id: customer_Id,
      payment_method: paymentMethod,
      created_by: session?.user?.id || 10,
      transactions: items,
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
          action={
            <CustomButton
              onClick={() => {
                router.push(
                  `/customers/${customer_Id}/invoices/${invoice_Id}/edit`,
                );
              }}
            >
              Edit Items
            </CustomButton>
          }
          data={items}
        />
      </div>
      <InvoiceCalcSections
        subTotal={subTotal}
        totalAmount={totalAmount}
        alertMessage={alertMessage}
        setAlertMessage={setAlertMessage}
        tax={tax}
        setTax={setTax}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        debitAmount={debitAmount}
        setDebitAmount={setDebitAmount}
        checkAmount={checkAmount}
        setCheckAmount={setCheckAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        saveInvoice={saveInvoice}
        downPayment={downPayment}
        setDownPayment={setDownPayment}
        mutation={mutation}
      />
    </div>
  );
}
