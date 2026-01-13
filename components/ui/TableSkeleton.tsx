export default function TableSkeleton({
  columns,
  length,
}: {
  columns: number;
  length: number;
}) {
  return (
    <>
      {Array.from({ length: length }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="py-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
