export default function CustomButton({
  children,
  onClick,
  className = "",
  isLoading = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <button
      className={`rounded bg-primary-600 px-3 py-2 text-sm text-white cursor-pointer ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={isLoading}
    >
      {children}
    </button>
  );
}
