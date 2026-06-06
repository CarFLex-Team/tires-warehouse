import {
  Banknote,
  BanknoteArrowDown,
  CalendarArrowDown,
  CheckCheck,
  Clock,
  CreditCard,
  HandCoins,
  Merge,
  Printer,
  Receipt,
} from "lucide-react";
import CustomButton from "../ui/CustomButton";
import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { DownPaymentForm } from "../Forms/downPaymentForm";

export default function InvoiceCalcSections({
  createdAt,
  subTotal,
  totalAmount,
  alertMessage,
  setAlertMessage,
  setCreatedAt,
  tax,
  setTax,
  cashAmount,
  setCashAmount,
  debitAmount,
  setDebitAmount,
  checkAmount,
  setCheckAmount,
  downPayment,
  setDownPayment,
  paymentMethod,
  setPaymentMethod,
  saveInvoice,
  saveInvoiceAsPending,
  saveInvoiceinMonthly,
  printInvoice,
  isDownloading,
  mutation,
}: {
  createdAt?: string;
  subTotal: number;
  totalAmount: number;
  alertMessage: string;
  setAlertMessage: (message: string) => void;
  setCreatedAt?: (date: string) => void;
  tax: string;
  setTax: (tax: string) => void;
  cashAmount: string;
  setCashAmount: (amount: string) => void;
  debitAmount: string;
  setDebitAmount: (amount: string) => void;
  checkAmount: string;
  setCheckAmount: (amount: string) => void;
  downPayment: string;
  setDownPayment: (amount: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  saveInvoice: () => void;
  saveInvoiceAsPending?: () => void;
  saveInvoiceinMonthly?: () => void;
  printInvoice?: () => void;
  isDownloading?: boolean;
  mutation: any;
}) {
  const date = new Date();
  const [dpOpen, setDpOpen] = useState(false);
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
  useEffect(() => {
    if (paymentMethod === "Debit") {
      setTax((subTotal * 0.07).toFixed(2).toString());
      setDebitAmount((subTotal + subTotal * 0.07).toFixed(2).toString());
      setCashAmount("0");
    } else if (paymentMethod === "Cash") {
      setTax("0");
      setCashAmount(subTotal.toString());
      setDebitAmount("0");
    } else if (paymentMethod === "Check") {
      setTax("0");
      setCheckAmount(subTotal.toString());
      setCashAmount("0");
      setDebitAmount("0");
    } else if (paymentMethod === "Mix") {
      const calculatedTax = (subTotal * 0.07).toFixed(2);
      const cashPortion = Math.floor(subTotal / 2);
      setTax(calculatedTax.toString());
      setCashAmount(cashPortion.toString());
      setDebitAmount(
        (subTotal - cashPortion + parseFloat(calculatedTax)).toString(),
      );
      setCheckAmount("0");
    } else {
      setTax("0");
      setCashAmount("0");
      setDebitAmount("0");
      setCheckAmount("0");
    }
  }, [paymentMethod, subTotal]);
  return (
    <>
      {dpOpen && (
        <Modal
          isOpen={dpOpen}
          onClose={() => setDpOpen(false)}
          title="Add Down Payment"
        >
          <DownPaymentForm
            onSuccess={() => {
              saveInvoiceAsPending && saveInvoiceAsPending();
            }}
            downPayment={downPayment}
            setDownPayment={setDownPayment}
            isPending={mutation.isPending}
            error={mutation.isError ? mutation.error : null}
          />
        </Modal>
      )}
      <div className="relative rounded-xl bg-white p-5 m-4 shadow-sm min-h-full flex-1 ">
        {createdAt && setCreatedAt && (
          <div className="space-y-1">
            <p className="font-semibold text-gray-800">Invoice Date</p>
            <input
              type="datetime-local"
              value={createdAt}
              max={now}
              onChange={(e) => setCreatedAt(e.target.value)}
              className=" flex items-center gap-1.5 rounded border border-primary-600  px-2 py-1 text-sm  cursor-pointer m-1 "
            />
          </div>
        )}
        <div className="space-y-1">
          {downPayment && !saveInvoiceAsPending && (
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-gray-800">Down Payment</p>
              <span className="text-sm text-gray-500">
                {downPayment ? `$${downPayment}` : "No down payment added"}
              </span>
            </div>
          )}
          <p className="font-semibold text-gray-800">Payment Method</p>
          <div className="flex gap-1.5 max-sm:flex-wrap">
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
                paymentMethod === "Check"
                  ? "bg-primary-600 text-white"
                  : "bg-white  text-primary-600 hover:bg-gray-100"
              }`}
              onClick={() => {
                setAlertMessage("");
                setPaymentMethod("Check");
              }}
            >
              <Receipt /> Check
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
          {paymentMethod === "Mix" && (
            <p className="text-sm text-gray-500">
              Cash: $
              <input
                type="text"
                value={cashAmount}
                onChange={(e) => {
                  setCashAmount(e.target.value);
                }}
                className=" w-9 rounded border border-gray-300 px-1 py-0.5  text-sm"
              />
            </p>
          )}
          {(paymentMethod === "Debit" || paymentMethod === "Mix") && (
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
                  const cash =
                    paymentMethod === "Mix" ? parseFloat(cashAmount) : 0;
                  const debit = (subTotal + numericVal - cash).toFixed(2);

                  setCashAmount(cash.toString());
                  setDebitAmount(debit);
                }}
                className=" w-9 rounded border border-gray-300 px-1 py-0.5  text-sm"
              />
            </p>
          )}
          {paymentMethod === "Mix" && (
            <>
              <p className="text-sm text-gray-500">
                Debit: $
                <input
                  type="text"
                  value={debitAmount}
                  max={totalAmount}
                  min={0}
                  onChange={(e) => {
                    setDebitAmount(e.target.value);
                    // setCashAmount(
                    //   (
                    //     totalAmount -
                    //     parseFloat(cashAmount) -
                    //     parseFloat(e.target.value || "0")
                    //   )
                    //     .toFixed(2)
                    //     .toString(),
                    // );
                  }}
                  className=" w-9 rounded border border-gray-300 px-1 py-0.5  text-sm"
                />
              </p>
              <p className="text-sm text-gray-500">
                Check: $
                <input
                  type="text"
                  value={checkAmount}
                  max={totalAmount}
                  min={0}
                  onChange={(e) => {
                    setCheckAmount(e.target.value);
                    // const remaining =
                    //   totalAmount - parseFloat(e.target.value || "0");
                    // const calculatedDebit = (remaining / 2).toFixed(2);
                    // setDebitAmount(calculatedDebit.toString());
                    // setCashAmount(
                    //   (remaining - parseFloat(calculatedDebit)).toString(),
                    // );
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
            className=" bg-green-600! mt-4 w-full flex items-center justify-center gap-2  "
            onClick={saveInvoice}
            isLoading={mutation.isPending}
          >
            <CheckCheck size={16} /> Save Invoice
          </CustomButton>
          {saveInvoiceinMonthly && (
            <CustomButton
              className="mt-4 w-full flex items-center justify-center gap-2"
              onClick={saveInvoiceinMonthly}
              isLoading={mutation.isPending}
            >
              <CalendarArrowDown size={16} /> Add to Monthly Invoice
            </CustomButton>
          )}
          <div className="flex gap-2">
            {printInvoice && (
              <CustomButton
                className=" bg-blue-600! mt-4 w-full flex items-center justify-center gap-2  "
                onClick={printInvoice}
                isLoading={isDownloading}
              >
                <Printer size={16} /> Print without Saving
              </CustomButton>
            )}
            {saveInvoiceAsPending && (
              <CustomButton
                className=" bg-white! border border-gray-400 text-gray-700! mt-4 w-full flex items-center justify-center gap-2"
                onClick={() => {
                  setAlertMessage("");
                  setDpOpen(true);
                }}
              >
                <Clock size={16} /> Save as Pending
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
