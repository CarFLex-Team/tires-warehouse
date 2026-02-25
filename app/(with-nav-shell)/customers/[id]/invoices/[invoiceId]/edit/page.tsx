import EditInvoice from "@/components/ClientRender/EditInvoice";
export default async function CreateInvoice({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const { id, invoiceId } = await params;

  return <EditInvoice customer_Id={id} invoice_Id={invoiceId} />;
}
