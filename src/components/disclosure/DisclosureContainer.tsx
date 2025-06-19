'use client';

import SearchFilterBar from './SearchFilterBar';
import DisclosureList from './DisclosureList';
import { Disclosure } from '@/types/common';
import useDisclosures from '@/hooks/useDisclosures';

type DisclosureContainerProps = {
  initialData: {
    disclosures: Disclosure[];
    hasMore: boolean;
    total: number;
  };
};

export default function DisclosureContainer({ initialData }: DisclosureContainerProps) {
  // 커스텀 훅 사용
  const {
    disclosures,
    isLoading,
    hasMore,
    handleFilterChange,
    loadMoreDisclosures
  } = useDisclosures({
    initialDisclosures: initialData.disclosures,
    initialHasMore: initialData.hasMore
  });

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
