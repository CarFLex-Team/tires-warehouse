import CustomerInvoices from "@/components/ClientRender/CustomerInvoices";

export default async function customer({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <>
      <CustomerInvoices customerId={id} isOwner={true} />
    </>
  );
}
