import { Disclosure, Exchange } from '@/types/common';

// API 기본 URL
const API_BASE_URL = '/api';

export type FetchDisclosuresParams = {
  exchange?: Exchange;
  startDate?: string;
  endDate?: string;
  page?: number;
};

// 공시 데이터 가져오기
export const fetchDisclosures = async (
  params: FetchDisclosuresParams
): Promise<{
  disclosures: Disclosure[];
  hasMore: boolean;
  total?: number;
}> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.exchange && params.exchange !== 'ALL') {
      queryParams.append('exchange', params.exchange);
    }

    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }

    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    // 페이지 매개변수 추가
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }

    const response = await fetch(`${API_BASE_URL}/disclosures?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch disclosures');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching disclosures:', error);
    return {
      disclosures: [],
      hasMore: false,
    };
  }
};
