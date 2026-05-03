export type TableColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  // cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
};
