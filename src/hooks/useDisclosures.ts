import { useState } from 'react';
import { Disclosure, Exchange } from '@/types/common';
import { fetchDisclosures } from '@/services/api';
import DateUtils, { DateRange } from '@/utils/dateUtils';

type UseDisclosuresProps = {
  initialDisclosures: Disclosure[];
  initialHasMore: boolean;
};

export function useDisclosures({ initialDisclosures, initialHasMore }: UseDisclosuresProps) {
  const [disclosures, setDisclosures] = useState<Disclosure[]>(initialDisclosures);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [page, setPage] = useState<number>(1);
  const [exchangeType, setExchangeType] = useState<Exchange>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });

  // 필터 변경 시 데이터 다시 로딩
  const handleFilterChange = (exchange: Exchange, newDateRange: DateRange) => {
    setExchangeType(exchange);
    setDateRange(newDateRange);
    setDisclosures([]);
    setPage(1);
    setHasMore(true);

    // 필터링된 데이터 로딩
    loadDisclosures(exchange, newDateRange, 1, true);
  };

  // 더 많은 데이터 로딩 (무한 스크롤)
  const loadMoreDisclosures = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadDisclosures(exchangeType, dateRange, nextPage);
  };

  // 공시 데이터 로딩 함수
  const loadDisclosures = async (
    exchange: Exchange = exchangeType,
    newDateRange: DateRange = dateRange,
    currentPage: number = page,
    isNewFilter: boolean = false
  ) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const dateParams = {
        startDate: newDateRange.startDate
          ? DateUtils.convertISOFormat(newDateRange.startDate)
          : undefined,
        endDate: newDateRange.endDate
          ? DateUtils.convertISOFormat(newDateRange.endDate)
          : undefined,
      };
      const params = {
        exchange,
        ...dateParams,
        page: currentPage,
      };

      const { disclosures: newDisclosures, hasMore: moreAvailable } = await fetchDisclosures(
        params
      );

      if (isNewFilter) {
        setDisclosures(newDisclosures);
      } else {
        setDisclosures((prev) => [...prev, ...newDisclosures]);
      }

      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Failed to load disclosures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    disclosures,
    isLoading,
    hasMore,
    exchangeType,
    dateRange,
    handleFilterChange,
    loadMoreDisclosures
  };
}

export default useDisclosures;
