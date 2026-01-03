"use client";
export default function AuthButton({
  className,
  title,
  onClick,
}: {
  className?: string;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border border-solid border-gray-300 text-gray-200  cursor-pointer shadow-md px-2.5 py-0.5 rounded-md  w-fit sm:text-base  transition-colors duration-200 ${className}`}
    >
      {title}
    </button>
  );
}
