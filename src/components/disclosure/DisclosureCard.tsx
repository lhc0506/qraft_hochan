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

  // 공시일과 현지시간 포맷팅
  const disclosureDate = DateUtils.convertYYYYMMDDHHMMSSFormat(date);
  const localTime = DateUtils.convertLocalTime(date, exchange);

  // 토픽은 최대 3개까지만 표시
  const displayTopics = topics.slice(0, 3);

  // 내용은 미리보기로 200자까지만 표시
  const previewContent = content.length > 200 ? `${content.substring(0, 200)}...` : content;

  const handleClick = () => {
    if (onClick) {
      onClick(disclosure);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex flex-col mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">공시일</span>
              <span className="text-sm text-gray-500">{disclosureDate}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">현지시간</span>
              <span className="text-sm text-gray-500">{localTime}</span>
            </div>
          </div>
          <h3 className="font-medium text-lg mt-1">{title}</h3>
        </div>
        <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
          {exchange === 'SHENZHEN' ? '심천' : '홍콩'}
        </div>
      </div>

      <div className="flex items-center mb-3">
        <span className="font-medium text-gray-700 mr-2">{stockName}</span>
        <span className="text-sm text-gray-500">{stockCode}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{category}</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {displayTopics.map((topic, index) => (
          <span
            key={index}
            className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
          >
            {topic}
          </span>
        ))}
      </div>

      <p className="text-gray-600 text-sm">{previewContent}</p>
    </div>
  );
}

export default DisclosureCard;
