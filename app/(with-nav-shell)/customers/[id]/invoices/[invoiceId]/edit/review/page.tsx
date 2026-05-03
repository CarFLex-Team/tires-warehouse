import ReviewEditInvoice from "@/components/ClientRender/ReviewEditInvoice";
export default async function EditInvoice({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const { id, invoiceId } = await params;

  return <ReviewEditInvoice customer_Id={id} invoice_Id={invoiceId} />;
}
