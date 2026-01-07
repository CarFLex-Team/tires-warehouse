import customers from "@/data/customers.json";
import InvoiceTransactions from "@/components/ClientRender/InvoiceTransactions";
export default async function invoice({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const { id, invoiceId } = await params;
  const customer = customers.find((c) => c.id === Number(id));
  const invoice = customer
    ? customer.invoices.find((inv) => inv.id === Number(invoiceId))
    : null;

  return <InvoiceTransactions invoice={invoice} customer={customer} />;
}
