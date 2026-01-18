import CreateNewInvoice from "@/components/ClientRender/CreateNewInvoice";
export default async function CreateInvoice({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <CreateNewInvoice customer_Id={id} />;
}
