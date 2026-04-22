export default function CustomButton({
  children,
  onClick,
  className,
  isLoading = false,
  isSelector = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  isLoading?: boolean;
  isSelector?: boolean;
}) {
  return (
    <button
      className={` ${isSelector ? className : "bg-primary-600 text-white rounded"} px-3 py-2 text-sm  cursor-pointer ${className}  disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={isLoading}
    >
      {children}
    </button>
  );
}
