import InvoiceTransactions from "@/components/ClientRender/InvoiceTransactions";
export default async function invoice({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const { invoiceId, id } = await params;

  return <InvoiceTransactions invoice_id={invoiceId} id={id} />;
}
