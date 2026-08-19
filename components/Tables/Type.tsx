export type TableColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  render?: (row: T) => React.ReactNode;
  // cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
};
