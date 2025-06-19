'use client';

import React from 'react';
import { ListChildComponentProps } from 'react-window';
import DisclosureCard from './DisclosureCard';
import { Disclosure } from '@/types/common';

interface DisclosureItemProps extends ListChildComponentProps {
  disclosures: Disclosure[];
  isItemLoaded: (index: number) => boolean;
  onDisclosureClick?: (disclosure: Disclosure) => void;
  onHeightChange: (id: string, height: number) => void;
  itemHeights: Record<string, number>;
}

/**
 * 가상 스크롤에서 각 공시 항목을 렌더링하는 컴포넌트
 */
export const DisclosureItem = React.memo(
  ({ index, style, disclosures, isItemLoaded, onDisclosureClick, onHeightChange, itemHeights }: DisclosureItemProps) => {
    // 스타일 수정 - 간격 보장을 위한 패딩 추가
    const itemStyle = {
      ...style,
      paddingTop: 8,     // 상단 여백
      paddingBottom: 8,  // 하단 여백
      paddingLeft: 16,   // 좌측 여백
      paddingRight: 16,  // 우측 여백
      width: '100%',     // 너비 100% 보장
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
                  onHeightChange(itemId, height);
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
  }
);

DisclosureItem.displayName = 'DisclosureItem';

export default DisclosureItem;
