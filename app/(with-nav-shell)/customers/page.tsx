"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import customersData from "@/data/customers.json";
import Modal from "@/components/ui/Modal";
export default function customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
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

  const filteredCustomers = customersData.filter((customer) => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.email.toLowerCase().includes(value) ||
      customer.phone.includes(value)
    );
  });

  return (
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Customer"
          buttonText="Add Customer"
        >
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Name</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Customer Name"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Email</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Customer Email"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Phone</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Customer Phone"
            />
          </div>
        </Modal>
      )}
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
            total: filteredCustomers.length,
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
              <CustomButton onClick={() => setOpen(true)}>
                Add Customer
              </CustomButton>
            </>
          }
        />
      </div>
    </>
  );
}
