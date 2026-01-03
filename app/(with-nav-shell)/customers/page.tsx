"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string;

    createdAt: string;
  };

  const customerColumns: TableColumn<Customer>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Created At", accessor: "createdAt" },
  ];
  const customers = [
    {
      id: 1,
      name: "Mazen Essam",
      email: "mazen.essam@example.com",
      phone: "123-456-7890",
      createdAt: "14 Apr 2022",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "987-654-3210",
      createdAt: "14 Apr 2022",
    },
    {
      id: 3,
      name: "Sara",
      email: "sara@example.com",
      phone: "123-456-7890",
      createdAt: "14 Apr 2022",
    },
    {
      id: 4,
      name: "Mohamed",
      email: "mohamed@example.com",
      phone: "123-456-7890",
      createdAt: "13 Apr 2022",
    },
  ];
  const filteredCustomers = customers.filter((customer) => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.email.toLowerCase().includes(value) ||
      customer.phone.includes(value)
    );
  });

  return (
    <div>
      <DataTable
        columns={customerColumns}
        data={
          isLoading
            ? []
            : filteredCustomers.slice((page - 1) * pageSize, page * pageSize)
        }
        onRowClick={(customer) => router.push(`/customers/${customer.id}`)}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: customers.length,
          onPageChange: setPage,
        }}
        action={
          <>
            <input
              type="text"
              placeholder="Search Customers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className=" p-2 border-b border-gray-300 focus:outline-none min-w-25"
            />
            <CustomButton onClick={() => {}}>Add Customer</CustomButton>
          </>
        }
      />
    </div>
  );
}
