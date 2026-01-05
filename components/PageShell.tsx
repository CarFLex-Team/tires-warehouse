"use client";
import { useEffect, useState } from "react";
import Sidebar from "./Nav/Sidebar";
import TopNav from "./Nav/TopNav";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
export default function PageShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);
  return (
    <SessionProvider>
      <div className="flex h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-col flex-1 overflow-auto">
          <TopNav onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1  bg-gray-100 ">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
