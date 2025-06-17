'use client';

import React, { useState } from 'react';
import { parseDate, DateRange, createDateRange } from '@/utils/dateUtils';
import { Exchange } from '@/types/common';

type SearchFilterBarProps = {
  onFilterChange: (exchange: Exchange, dateRange: DateRange) => void;
};

export function SearchFilterBar({ onFilterChange }: SearchFilterBarProps) {
  const [exchangeType, setExchangeType] = useState<Exchange>('ALL');
  const [dateRange, setDateRange] = useState<DateRange>(createDateRange(null, null));

  const handleExchangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exchange = e.target.value as Exchange;
    setExchangeType(exchange);
    onFilterChange(exchange, dateRange);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value ? parseDate(e.target.value) : null;
    const newDateRange = { ...dateRange, startDate };
    setDateRange(newDateRange);
    onFilterChange(exchangeType, newDateRange);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value ? parseDate(e.target.value) : null;
    const newDateRange = { ...dateRange, endDate };
    setDateRange(newDateRange);
    onFilterChange(exchangeType, newDateRange);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="w-full md:w-1/3">
        <label htmlFor="exchange" className="block text-sm font-medium text-gray-700 mb-1">
          거래소
        </label>
        <select
          id="exchange"
          value={exchangeType}
          onChange={handleExchangeChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="ALL">모든 거래소</option>
          <option value="SHENZHEN">심천</option>
          <option value="HONGKONG">홍콩</option>
        </select>
      </div>

      <div className="w-full md:w-1/3">
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
          시작일
        </label>
        <input
          type="date"
          id="startDate"
          onChange={handleStartDateChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="w-full md:w-1/3">
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
          종료일
        </label>
        <input
          type="date"
          id="endDate"
          onChange={handleEndDateChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export default SearchFilterBar;
