import ReviewNewInvoice from "@/components/ClientRender/ReviewNewInvoice";
export default async function CreateInvoice({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <ReviewNewInvoice customer_Id={id} />;
}
