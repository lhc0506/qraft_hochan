'use client';

import React from 'react';
import { Disclosure } from '@/types/common';
import DateUtils from '@/utils/dateUtils';

type DisclosureCardProps = {
  disclosure: Disclosure;
  onClick?: (disclosure: Disclosure) => void;
};

export function DisclosureCard({ disclosure, onClick }: DisclosureCardProps): React.ReactNode {
  const { date, stockName, stockCode, exchange, topics, category, title, content } = disclosure;

  const formattedData = React.useMemo(() => {
    const disclosureDate = DateUtils.convertYYYYMMDDHHMMSSFormat(date);
    const localTime = DateUtils.convertLocalTime(date, exchange);

    const displayTopics = topics.slice(0, 3);

    const previewContent = content.length > 200 ? `${content.substring(0, 200)}...` : content;

    return {
      disclosureDate,
      localTime,
      displayTopics,
      previewContent,
      exchangeName: exchange === 'SHENZHEN' ? '심천' : '홍콩',
    };
  }, [date, exchange, topics, content]);

  // 클릭 핸들러
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(disclosure);
    }
  }, [onClick, disclosure]);

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex flex-col mb-2 w-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 mr-2">공시일</span>
              <span className="text-sm text-gray-500">{formattedData.disclosureDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 mr-2">현지시간</span>
              <span className="text-sm text-gray-500">{formattedData.localTime}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">{stockCode}</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">{stockName}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                {category}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {formattedData.displayTopics.map((topic: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
              >
                {topic}
              </span>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded w-fit">
              {formattedData.exchangeName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-lg mt-1">{title}</h3>
        <p className="text-gray-600 text-sm">{formattedData.previewContent}</p>
      </div>
    </div>
  );
}

export default DisclosureCard;
