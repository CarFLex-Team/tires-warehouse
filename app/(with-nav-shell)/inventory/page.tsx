"use client";
import Inventory from "@/components/ClientRender/Inventory";
import StockAlert from "@/components/ClientRender/StockAlert";
import CustomButton from "@/components/ui/CustomButton";
import { useState } from "react";
export default function InventoryPage() {
  const [currentTab, setCurrentTab] = useState("inventory");
  const [error, setError] = useState<string | null>(null);
  if (error)
    return (
      <p className="text-red-500 text-center">
        Error {error || "An error occurred"}
      </p>
    );
  return (
    <>
      <div className="m-4 flex justify-center">
        <CustomButton
          onClick={() => setCurrentTab("inventory")}
          isSelector={true}
          className={` border border-primary-600 ${currentTab === "inventory" ? "bg-primary-600 text-white " : "bg-gray-100 text-primary-600  "}`}
        >
          Inventory
        </CustomButton>
        <CustomButton
          onClick={() => setCurrentTab("alert")}
          isSelector={true}
          className={` border border-primary-600 ${currentTab === "alert" ? "bg-primary-600 text-white " : "bg-gray-100 text-primary-600  "}`}
        >
          Stock Alert
        </CustomButton>
      </div>
      {currentTab === "inventory" ? (
        <Inventory setError={setError} />
      ) : (
        <StockAlert setError={setError} />
      )}
    </>
  );
}
