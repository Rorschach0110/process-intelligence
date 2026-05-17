import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string | number;
};

export function DataTable<T>({ rows, columns, rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>{columns.map((column) => <th className="px-4 py-3" key={column.key}>{column.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr className="hover:bg-slate-50" key={rowKey(row, index)}>
              {columns.map((column) => <td className="px-4 py-3 align-top" key={column.key}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
