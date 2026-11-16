import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import { EmptyState } from '../EmptyState/EmptyState';
import { cn } from '@/utils/helpers';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  /** Mức độ ưu tiên cột: 'low' sẽ tự ẩn trên máy tính bảng (md) và chỉ hiện từ lg trở lên */
  priority?: 'high' | 'medium' | 'low';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  keyExtractor?: (item: T, index: number) => string | number;
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
}

// Bảng dữ liệu đáp ứng: bảng đầy đủ trên lg, ẩn cột ưu tiên thấp trên md, chuyển thành thẻ xếp dọc trên di động
export function Table<T extends object>({
  columns,
  data,
  isLoading = false,
  emptyText = 'Chưa có bản ghi nào',
  keyExtractor,
  renderMobileCard,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-[16px] border border-[#F3D9E3] p-12">
        <Spinner size="md" label="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-[16px] border border-[#F3D9E3]">
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
    <div className="w-full">
      {/* Chế độ di động (< md): Mỗi hàng là một thẻ thông tin xếp dọc */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => {
          const rowKey = keyExtractor
            ? keyExtractor(row, idx)
            : ((row as any).id as string | number) || idx;

          if (renderMobileCard) {
            return (
              <div
                key={rowKey}
                className="bg-white rounded-[16px] border border-[#F3D9E3] p-4 shadow-card"
              >
                {renderMobileCard(row, idx)}
              </div>
            );
          }

          return (
            <div
              key={rowKey}
              className="bg-white rounded-[16px] border border-[#F3D9E3] p-4 shadow-card divide-y divide-[#F3D9E3]"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <span className="text-[13px] font-semibold text-[#6B5560] flex-shrink-0">
                    {col.header}
                  </span>
                  <div className="text-[14px] font-semibold text-[#3B2A35] text-right">
                    {col.render
                      ? col.render(row, idx)
                      : ((row as any)[col.key] as React.ReactNode)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Chế độ Máy tính bảng (md) & Máy tính bàn (lg+): Bảng chuẩn, ẩn cột ưu tiên thấp (priority='low') dưới màn hình lg */}
      <div className="hidden md:block w-full overflow-hidden rounded-[16px] border border-[#F3D9E3] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-[#3B2A35]">
            <thead className="bg-[#DCEBFA] border-b border-[#F3D9E3] text-[13px] font-semibold text-[#1F4E79]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      'px-5 py-3.5',
                      getAlignClass(col.align),
                      col.priority === 'low' && 'hidden lg:table-cell'
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3D9E3]">
              {data.map((row, idx) => (
                <tr
                  key={
                    keyExtractor
                      ? keyExtractor(row, idx)
                      : ((row as any).id as string | number) || idx
                  }
                  className="hover:bg-[#FFF6F9] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-3.5',
                        getAlignClass(col.align),
                        col.priority === 'low' && 'hidden lg:table-cell'
                      )}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : ((row as any)[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
