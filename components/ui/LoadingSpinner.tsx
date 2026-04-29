export default function LoadingSpinner({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div
      className={` border-4 border-gray-300 border-t-primary-500 dark:border-t-primary-600 rounded-full animate-spin ${width ? `w-${width}` : "w-4"} ${height ? `h-${height}` : "h-4"}`}
    ></div>
  );
}
