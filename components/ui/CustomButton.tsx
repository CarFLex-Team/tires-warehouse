export default function CustomButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className="rounded bg-primary-600 px-3 py-2 text-sm text-white cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
