import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import { EmptyState } from '../EmptyState/EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function Table<T extends object>({
  columns,
  data,
  isLoading = false,
  emptyText = 'Chưa có bản ghi nào',
  keyExtractor,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-12">
        <Spinner size="md" label="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200">
        <EmptyState description={emptyText} />
      </div>
    );
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-6 py-3.5 ${getAlignClass(col.align)}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr
                key={keyExtractor ? keyExtractor(row, idx) : ((row as any).id as string | number) || idx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${getAlignClass(col.align)}`}>
                    {col.render ? col.render(row, idx) : ((row as any)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

