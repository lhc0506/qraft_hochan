'use client';

import React, { useEffect, useRef } from 'react';
import DisclosureCard from './DisclosureCard';
import { Disclosure } from '@/types/common';

type DisclosureListProps = {
  disclosures: Disclosure[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDisclosureClick?: (disclosure: Disclosure) => void;
};

export function DisclosureList({
  disclosures,
  isLoading,
  hasMore,
  onLoadMore,
  onDisclosureClick,
}: DisclosureListProps): React.ReactNode {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 구현
  useEffect(() => {
    if (isLoading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, onLoadMore]);

  if (disclosures.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disclosures.map((disclosure) => (
        <DisclosureCard key={disclosure.id} disclosure={disclosure} onClick={onDisclosureClick} />
      ))}

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 무한 스크롤을 위한 관찰 요소 */}
      {hasMore && !isLoading && <div ref={loadMoreRef} className="h-10" />}

      {/* 더 이상 불러올 데이터가 없을 때 */}
      {!hasMore && disclosures.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">모든 공시를 불러왔습니다.</div>
      )}
    </div>
  );
}

export default DisclosureList;
