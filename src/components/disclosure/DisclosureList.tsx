'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Disclosure } from '@/types/common';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import DisclosureCard from './DisclosureCard';

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
  // 가상 스크롤 구현을 위한 상태 및 참조
  const listRef = useRef<List | null>(null);
  const infiniteLoaderRef = useRef<InfiniteLoader>(null);

  // 기본 아이템 높이
  const defaultItemHeight = 300;

  // 아이템 높이 캐시
  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({});

  // 아이템 총 개수 (마지막에 로딩 표시기를 위한 +1)
  const itemCount = hasMore ? disclosures.length + 1 : disclosures.length;

  // 아이템이 로드되었는지 확인하는 함수 - 다른 함수보다 먼저 선언
  const isItemLoaded = useCallback(
    (index: number): boolean => {
      return !hasMore || index < disclosures.length;
    },
    [hasMore, disclosures.length]
  );

  // 리스트 리사이즈 함수
  const resetListCache = useCallback(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, []);

  // 아이템 높이 가져오기 함수
  const getItemHeight = useCallback(
    (index: number) => {
      // 로딩 중이거나 더 이상 불러올 데이터가 없는 경우
      if (!isItemLoaded(index)) {
        return 80; // 로딩 표시기 높이
      }

      // 캐시된 높이가 있는지 확인
      const itemId = disclosures[index]?.id;
      if (itemId && itemHeights[itemId]) {
        return itemHeights[itemId] + 16; // 패딩 포함
      }

      return defaultItemHeight; // 기본 높이
    },
    [disclosures, itemHeights, isItemLoaded]
  );

  // 디스클로저 변경 시 리스트 리사이즈
  useEffect(() => {
    resetListCache();
  }, [disclosures, resetListCache]);

  // 아이템 높이 변경 시 리스트 리사이즈
  useEffect(() => {
    resetListCache();
  }, [itemHeights, resetListCache]);

  // 더 많은 아이템 로드 함수
  const loadMoreItems = useCallback(() => {
    if (!isLoading) {
      return new Promise<void>((resolve) => {
        onLoadMore();
        resolve();
      });
    }
    return Promise.resolve();
  }, [isLoading, onLoadMore]);

  // 각 아이템 렌더링을 위한 컴포넌트
  const DisclosureItemRenderer = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      // 스타일 수정 - 간격 보장을 위한 패딩 추가
      const itemStyle = {
        ...style,
        paddingTop: 8, // 상단 여백
        paddingBottom: 8, // 하단 여백
        paddingLeft: 16, // 좌측 여백
        paddingRight: 16, // 우측 여백
        width: '100%', // 너비 100% 보장
        boxSizing: 'border-box' as const, // 패딩이 너비에 포함되도록 설정
      };

      // 로딩 중이거나 더 이상 불러올 데이터가 없는 경우
      if (!isItemLoaded(index)) {
        return (
          <div style={itemStyle} className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      }

      // 공시 카드 렌더링
      return (
        <div style={itemStyle}>
          <div
            className="w-full bg-white rounded-lg shadow-sm"
            ref={(node) => {
              // 노드가 마운트되면 높이 측정
              if (node && disclosures[index]) {
                const height = node.getBoundingClientRect().height;
                const itemId = disclosures[index].id;

                // 높이가 변경되었을 때만 업데이트
                if (itemHeights[itemId] !== height) {
                  // 비동기적으로 상태 업데이트
                  setTimeout(() => {
                    setItemHeights((prev) => {
                      const newHeights = { ...prev, [itemId]: height };
                      return newHeights;
                    });
                  }, 0);
                }
              }
            }}
          >
            <DisclosureCard
              key={disclosures[index].id}
              disclosure={disclosures[index]}
              onClick={onDisclosureClick}
            />
          </div>
        </div>
      );
    },
    [disclosures, isItemLoaded, itemHeights, onDisclosureClick]
  );

  if (disclosures.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <InfiniteLoader
        ref={infiniteLoaderRef}
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        threshold={5} // 미리 로드할 아이템 수
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={(list) => {
              // 두 개의 ref를 연결
              if (list) {
                ref(list);
              }
              listRef.current = list;
            }}
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            height={800}
            width="100%"
            itemCount={itemCount}
            itemSize={getItemHeight} // 동적 높이 계산 함수 사용
            onItemsRendered={onItemsRendered}
            overscanCount={3} // 화면 밖에 미리 렌더링할 아이템 수
            style={{ paddingLeft: 0, paddingRight: 0 }} // 리스트 자체의 패딩 제거
          >
            {DisclosureItemRenderer}
          </List>
        )}
      </InfiniteLoader>
      {/* 더 이상 불러올 데이터가 없을 때 */}
    </div>
  );
}

export default DisclosureList;
