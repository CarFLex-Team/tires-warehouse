import { Home, Users, CreditCard, Hammer, Package } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};
type Role = "OWNER" | "TEAM";

export const navByRole: Record<Role, NavItem[]> = {
  OWNER: [
    {
      id: "ownerDashboard",
      label: "Dashboard",
      href: "/owner/dashboard",
      icon: Home,
    },
    // {
    //   id: "ownerTransactions",
    //   label: "Transactions",
    //   href: "/owner/transactions",
    //   icon: CreditCard,
    // },
    {
      id: "ownerInventory",
      label: "Inventory",
      href: "/owner/inventory",
      icon: Package,
    },
    {
      id: "ownerCustomers",
      label: "Customers",
      href: "/owner/customers",
      icon: Users,
    },
    {
      id: "ownerServices",
      label: "Services",
      href: "/owner/services",
      icon: Hammer,
    },

    // {
    //   id: "ownerSettings",
    //   label: "Settings",
    //   href: "/owner/settings",
    //   icon: Settings,
    // },
  ],

  TEAM: [
    { id: "teamDashboard", label: "Dashboard", href: "/dashboard", icon: Home },
    {
      id: "teamCustomers",
      label: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      id: "teamInventory",
      label: "Inventory",
      href: "/inventory",
      icon: Package,
    },
    {
      id: "teamServices",
      label: "Services",
      href: "/services",
      icon: Hammer,
    },
  ],
};
