import React from 'react';
import { cn } from '@/utils/helpers';

export interface PageHeaderProps {
  title: string;
  badge?: React.ReactNode;
  marginNote?: string;
  stickers?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

// Đầu trang dùng chung đáp ứng đa thiết bị: tự xuống dòng trên màn hình nhỏ, ẩn sticker dưới md, nút chính full-width trên di động
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  badge,
  marginNote,
  stickers,
  breadcrumb,
  actions,
  className,
}) => {
  return (
    <header
      className={cn(
        'w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:min-h-[88px]',
        className
      )}
    >
      <div className="flex flex-col justify-center min-w-0">
        {breadcrumb && <div className="mb-1">{breadcrumb}</div>}

        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
          <h1 className="font-playfair text-[24px] md:text-[28px] font-bold text-[#3B2A35] leading-tight">
            {title}
          </h1>
          {badge}
        </div>

        {(marginNote || stickers) && (
          <div className="flex items-center mt-1.5 flex-wrap gap-2">
            {marginNote && (
              <div className="inline-block transform -rotate-1 origin-left">
                <span className="font-playfair italic text-[14px] md:text-[15px] font-semibold text-[#A61E4D] squiggle-underline-note">
                  {marginNote}
                </span>
              </div>
            )}
            {stickers && (
              <div className="hidden md:flex items-center gap-2 ml-6">
                {stickers}
              </div>
            )}
          </div>
        )}
      </div>

      {actions && (
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0 [&>button]:w-full [&>button]:md:w-auto [&>button]:min-h-[44px] [&>a]:w-full [&>a]:md:w-auto [&>a]:min-h-[44px]">
          {actions}
        </div>
      )}
    </header>
  );
};

