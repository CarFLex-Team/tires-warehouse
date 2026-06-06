"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { redirect, useRouter } from "next/navigation";
import { useInvoiceDraft } from "@/stores/useInvoiceDraft";
import { Banknote, CreditCard, Merge, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvoice } from "@/lib/api/invoices";
import { useSession } from "next-auth/react";
import { Transaction } from "@/lib/api/transactions";
import { downloadPdf } from "@/lib/api/donwloadPdf";
import { title } from "process";
import InvoiceCalcSections from "./InvoiceCalcSections";

export default function ReviewNewInvoice({
  customer_Id,
}: {
  customer_Id: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, customerId } = useInvoiceDraft();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const date = new Date();

  const now = date
    .toLocaleString("sv-SE", {
      timeZone: "America/Chicago",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(" ", "T"); // "2026-05-13T02:31"
  const [cratedAt, setCreatedAt] = useState<string>(now);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("");
  const [checkAmount, setCheckAmount] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
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
    { header: "Cost", accessor: "cost" },
  ];
  const subTotal = items.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );

  const totalAmount = subTotal + parseFloat(tax || "0");

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
    if (!customerId) {
      return;
    }
    mutation.mutate({
      total: totalAmount,
      cash_amount: parseFloat(cashAmount) || 0,
      debit_amount: parseFloat(debitAmount) || 0,
      check_amount: parseFloat(checkAmount) || 0,
      down_payment: parseFloat(downPayment) || 0,
      subtotal: subTotal,
      tax: parseFloat(tax || "0"),
      customer_id: customerId,
      status: "finished",
      payment_method: paymentMethod,
      transactions: items,
      created_by: session?.user?.id || 10,
      created_at: new Date(cratedAt).toISOString(),
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
      created_at: new Date(cratedAt).toISOString(),
      down_payment: parseFloat(downPayment) || 0,
    });
  }
  function saveInvoiceinMonthly() {
    if (!customerId) {
      return;
    }

    mutation.mutate({
      subtotal: subTotal,
      customer_id: customerId,
      status: "pending",
      transactions: items,
      created_by: session?.user?.id || 10,
      created_at: new Date(cratedAt).toISOString(),
      is_monthly_invoice: true,
    });
  }
  function printInvoice() {
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
    if (!customerId) {
      return;
    }
    const data = {
      title: "Quotation",
      id: "0",
      invoice_no: 1,
      created_at: new Date(cratedAt).toISOString(),
      total_amount: totalAmount.toString(),
      subtotal: subTotal.toString(),
      cash_amount: parseFloat(cashAmount) || 0,
      debit_amount: parseFloat(debitAmount) || 0,
      tax: tax || "0",
      check_amount: parseFloat(checkAmount) || 0,
      customer_id: customerId,
      payment_method: paymentMethod,
      transactions: items.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
      created_by: session?.user?.name || "",
      created_by_name: session?.user?.name || "",
      status: "pending" as "pending",
      customer_name: "",
      customer_phone: "",
    };
    downloadPdf(data, setIsDownloading);
  }
  return (
    <div className="flex flex-col lg:flex-row  ">
      <div className="flex-3">
        <DataTable title="Review" columns={invoiceItemColumns} data={items} />
      </div>
      <InvoiceCalcSections
        createdAt={cratedAt}
        subTotal={subTotal}
        totalAmount={totalAmount}
        alertMessage={alertMessage}
        setAlertMessage={setAlertMessage}
        setCreatedAt={setCreatedAt}
        tax={tax}
        setTax={setTax}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        debitAmount={debitAmount}
        setDebitAmount={setDebitAmount}
        checkAmount={checkAmount}
        setCheckAmount={setCheckAmount}
        downPayment={downPayment}
        setDownPayment={setDownPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        saveInvoice={saveInvoice}
        saveInvoiceAsPending={saveInvoiceAsPending}
        saveInvoiceinMonthly={saveInvoiceinMonthly}
        printInvoice={printInvoice}
        isDownloading={isDownloading}
        mutation={mutation}
      />
    </div>
  );
}
