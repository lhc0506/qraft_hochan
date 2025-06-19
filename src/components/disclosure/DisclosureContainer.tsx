'use client';

import { useState } from 'react';
import SearchFilterBar from './SearchFilterBar';
import DisclosureList from './DisclosureList';
import { Disclosure, Exchange } from '@/types/common';
import { fetchDisclosures } from '@/services/api';
import DateUtils, { DateRange } from '@/utils/dateUtils';

type DisclosureContainerProps = {
  initialData: {
    disclosures: Disclosure[];
    hasMore: boolean;
    total: number;
  };
};

export default function DisclosureContainer({ initialData }: DisclosureContainerProps) {
  const [disclosures, setDisclosures] = useState<Disclosure[]>(initialData.disclosures);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(initialData.hasMore);
  const [page, setPage] = useState<number>(1);
  const [exchangeType, setSelectedExchange] = useState<Exchange>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>(DateUtils.createDateRange(null, null));

  // 필터 변경 시 데이터 다시 로딩
  const handleFilterChange = (exchange: Exchange, newDateRange: DateRange) => {
    setSelectedExchange(exchange);
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

  // 공시 클릭 핸들러
  const handleDisclosureClick = (disclosure: Disclosure) => {
    console.log('Disclosure clicked:', disclosure);
  };

  return (
    <>
      <div className="mb-6">
        <SearchFilterBar onFilterChange={handleFilterChange} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">공시 목록</h2>
        <DisclosureList
          disclosures={disclosures}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMoreDisclosures}
          onDisclosureClick={handleDisclosureClick}
        />
      </div>
    </>
  );
}
