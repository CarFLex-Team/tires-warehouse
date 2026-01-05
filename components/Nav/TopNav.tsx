"use client";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  if (!session) return null;
  const name = session.user.name;
  return (
    <nav
      className="flex justify-between  items-center min-h-17  px-6 sm:px-9 bg-white  "
      aria-label="Listings navigation"
    >
      <button
        onClick={onMenuClick}
        className="md:opacity-0 md:w-25 max-md:block"
        aria-controls="mobile-listings-aside"
      >
        <Menu size={28} />
      </button>

      <div className="w-fit ">
        <p className="text-lg font-semibold">Welcome, {name?.split(" ")[0]}</p>
      </div>
    </nav>
  );
}
