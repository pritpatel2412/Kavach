import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  emptyText?: string;
  stickyHeader?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className = '',
  emptyText = 'No data available',
  stickyHeader = true,
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto rounded-md border border-hairline bg-surface ${className}`}>
      <table className="w-full text-left text-body font-sans" style={{ fontFeatureSettings: '"tnum"' }}>
        <thead
          className={`border-b border-hairline bg-canvas text-micro uppercase tracking-wider text-body font-bold select-none ${
            stickyHeader ? 'sticky top-0 z-10' : ''
          }`}
        >
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={`px-4 py-3 font-bold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted font-medium">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-canvas transition-colors duration-120">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`px-4 py-3 text-caption text-ink font-medium ${col.className || ''}`}>
                    {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
