import { Home, Users, CreditCard, Settings, BarChart } from "lucide-react";

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
    {
      id: "ownerTransactions",
      label: "Transactions",
      href: "/owner/transactions",
      icon: CreditCard,
    },
    {
      id: "ownerCustomers",
      label: "Customers",
      href: "/owner/customers",
      icon: Users,
    },
    {
      id: "ownerReports",
      label: "Reports",
      href: "/owner/reports",
      icon: BarChart,
    },
    {
      id: "ownerSettings",
      label: "Settings",
      href: "/owner/settings",
      icon: Settings,
    },
  ],

  TEAM: [
    { id: "teamDashboard", label: "Dashboard", href: "/dashboard", icon: Home },
    {
      id: "teamTransactions",
      label: "Transactions",
      href: "/transactions",
      icon: CreditCard,
    },
    {
      id: "teamCustomers",
      label: "Customers",
      href: "/customers",
      icon: Users,
    },
  ],
};
