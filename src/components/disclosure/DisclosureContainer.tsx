'use client';

import React from 'react';
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

/**
 * 공시 데이터 컨테이너 컴포넌트
 * 초기 데이터를 받아 필터링, 무한 스크롤 및 가상 스크롤 기능을 관리
 */
export default function DisclosureContainer({ initialData }: DisclosureContainerProps) {
  // 커스텀 훅을 통한 공시 데이터 관리
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

  // 공시 클릭 핸들러 - 추후 상세 페이지로 이동 또는 모달 표시 가능
  const handleDisclosureClick = React.useCallback((disclosure: Disclosure) => {
    console.log('Disclosure clicked:', disclosure);
    // TODO: 상세 페이지로 이동하거나 모달 표시 기능 구현
  }, []);

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
