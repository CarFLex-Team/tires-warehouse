"use client";
import { useEffect, useState } from "react";
import NavButton from "../ui/NavButton";
import {
  X,
  PanelLeftClose,
  LogOut,
  House,
  CircleUserRound,
  Package,
  Receipt,
  PanelLeftOpen,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { navByRole } from "@/nav.config";

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { data: session, status } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname() ?? "/";
  const role = session?.user.role as "OWNER" | "TEAM" | undefined;
  const navItems = role ? navByRole[role] : [];
  useEffect(() => {
    if (!navItems.length) return;

    const current = navItems.find((i) => i.href === pathname);

    setActive(current?.label || null);
  }, [pathname, navItems]);
  if (status === "loading") {
    return null; // or skeleton
  }
  if (!session) return null;
  return (
    <>
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 z-20 md:hidden ${
          open ? "opacity-100" : "hidden"
        }`}
        onClick={() => setOpen(false)}
        aria-label="Close menu"
      />

      <aside
        className={`h-screen flex flex-col justify-between bg-white border-r-2 border-r-gray-100  p-4 z-50  max-md:fixed max-md:inset-0 transform transition-transform duration-300 ease-in-out ${
          open ? "w-58 max-md:translate-x-0" : "w-16 max-md:-translate-x-full"
        }`}
      >
        <div className="overflow-auto">
          <div
            className={`flex items-center  mb-4 ${
              open ? "justify-between" : "justify-center"
            }`}
          >
            {open && <img src="/Logo.png" alt=" Logo" className=" w-8" />}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Close listings menu"
              className="p-1 rounded-sm  hover:bg-gray-100 cursor-pointer"
            >
              {open ? (
                <PanelLeftClose size={22} />
              ) : (
                <PanelLeftOpen size={22} />
              )}
            </button>
          </div>

          <div
            className="flex flex-col gap-2 mt-10"
            aria-label="Mobile listings"
          >
            {navItems.map((item) => (
              <NavButton
                key={item.href}
                onClick={() => setActive(item.label)}
                item={item}
                isActive={active === item.label}
                className={
                  open ? " px-4 py-3 rounded-lg" : "p-1 mb-2 rounded-md"
                }
              >
                <item.icon size={20} />
                {open && item.label}
              </NavButton>
            ))}
          </div>
        </div>
        <a
          onClick={() => {
            signOut({ callbackUrl: "/login" });
          }}
          className={`flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-100 decoration-none rounded-lg ${
            open ? " px-3 py-2 " : "p-1  "
          }`}
        >
          <LogOut size={20} /> {open && <span>Sign Out</span>}
        </a>
      </aside>
    </>
  );
}
