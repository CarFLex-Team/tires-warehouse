import type { ReactNode } from "react";
import Link from "next/link";
interface NavButtonProps {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  item: { id: string; label: string; href: string };
  isActive?: boolean;
}

export default function NavButton(props: NavButtonProps) {
  const { className, onClick, children, item, isActive } = props;

  return (
    <Link
      href={`${item.href}`}
      className={`flex gap-2 items-center text-left w-full  font-medium text-sm transition-colors text-primary-600 hover:bg-gray-100 ${className} ${
        isActive
          ? "text-white bg-primary-600 shadow-[0_0px_6px_rgba(0,0,0,0.5)]  hover:bg-primary-600 "
          : //+ colorMap[item.label]
            ""
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
