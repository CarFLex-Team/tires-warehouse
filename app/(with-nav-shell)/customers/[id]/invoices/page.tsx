import CustomerInvoices from "@/components/ClientRender/CustomerInvoices";

import customers from "@/data/customers.json";
export default async function customer({ params }: { params: { id: string } }) {
  const { id } = await params;
  const customer = customers.find((c) => c.id === Number(id));

  return (
    <>
      <CustomerInvoices customerId={id} />
    </>
  );
}
