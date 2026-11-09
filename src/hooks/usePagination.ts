import { useState, useCallback } from 'react';
import { PAGINATION_DEFAULTS } from '@/config/constants';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState<number>(options.initialPage || PAGINATION_DEFAULTS.DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(options.initialLimit || PAGINATION_DEFAULTS.DEFAULT_LIMIT);
  const [total, setTotal] = useState<number>(0);

  const totalPages = Math.ceil(total / limit) || 1;

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(PAGINATION_DEFAULTS.DEFAULT_PAGE);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    goToPage,
    changeLimit,
    resetPagination,
  };
}

