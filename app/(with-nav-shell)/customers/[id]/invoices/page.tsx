import CustomerInvoices from "@/components/CustomerInvoices";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
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
