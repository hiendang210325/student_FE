import React from 'react';
import { cn } from '@/utils/helpers';

export interface TileGridProps {
  children: React.ReactNode;
  className?: string;
}

// Lưới ô vuông đáp ứng: 2 cột trên di động, 3 cột trên máy tính bảng, 4 cột trên máy tính để bàn
export const TileGrid: React.FC<TileGridProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6',
        className
      )}
    >
      {children}
    </div>
  );
};

export interface SquareTileProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Ô vuông giữ tỷ lệ 1:1 (aspect-square) trên mọi kích thước màn hình
export const SquareTile: React.FC<SquareTileProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'aspect-square w-full rounded-[16px] md:rounded-[20px] p-4 md:p-5 lg:p-6 box-border flex flex-col justify-between transition-all duration-200 select-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

