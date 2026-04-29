export default function LoadingSpinner({
  width = 4,
  height = 4,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div
      className={`w-${width} h-${height} border-4 border-gray-300 border-t-primary-500 dark:border-t-primary-600 rounded-full animate-spin`}
    ></div>
  );
}
