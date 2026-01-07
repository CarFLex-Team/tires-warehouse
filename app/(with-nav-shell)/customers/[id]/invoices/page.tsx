import CustomerInvoices from "@/components/ClientRender/CustomerInvoices";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { InfoCard } from "@/components/ui/InfoCard";
import customers from "@/data/customers.json";
export default async function customer({ params }: { params: { id: string } }) {
  const { id } = await params;
  const customer = customers.find((c) => c.id === Number(id));

  return (
    <>
      <CustomerInvoices customer={customer} />
    </>
  );
}
