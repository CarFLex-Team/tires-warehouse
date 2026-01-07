import customers from "@/data/customers.json";

import CreateNewInvoice from "@/components/ClientRender/CreateNewInvoice";
export default async function CreateInvoice({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const customer = customers.find((c) => c.id === Number(id));

  return <CreateNewInvoice customer={customer} />;
}
