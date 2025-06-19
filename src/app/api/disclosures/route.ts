import { NextRequest, NextResponse } from 'next/server';
import shenzhenData from '@/data/shenzhen.json';
import hongkongData from '@/data/hongkong.json';
import { Disclosure, Exchange, ExchangeCode } from '@/types/common';
import DateUtils from '@/utils/dateUtils';
import { getCategoryName } from '@/data/categories';

const ITEMS_PER_PAGE = 10;

interface DisclosureJsonItem {
  id: string;
  dataDate: string;
  korName: string;
  details: {
    secName: string[];
    secCode: string[];
    categoryId: string | string[];
    fileLink?: string;
  };
  analysisDetails: {
    topicKor: string;
    summarizeTinyKor: string;
    summarizeLongKor: string;
    categoryKor?: string;
  };
}

interface DisclosureJsonData {
  data: {
    getDisclosure: DisclosureJsonItem[];
  };
}

interface ApiResponse {
  disclosures: Disclosure[];
  hasMore: boolean;
  total: number;
  error?: string;
}

interface QueryParams {
  exchange: Exchange;
  startDate?: string;
  endDate?: string;
  page: number;
}

/**
 * 요청 파라미터 추출 및 검증
 */
function extractQueryParams(request: NextRequest): QueryParams {
  const searchParams = request.nextUrl.searchParams;

  // 파라미터 추출 및 기본값 설정
  const exchange = (searchParams.get('exchange') as Exchange) || 'ALL';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const pageParam = searchParams.get('page');

  // 페이지 번호 검증
  let page = 1;
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  }

  return { exchange, startDate, endDate, page };
}

/**
 * 카테고리 ID 추출 함수
 */
function extractCategoryId(categoryId: string | string[]): string {
  if (typeof categoryId === 'string') {
    return categoryId;
  }

  return Array.isArray(categoryId) && categoryId.length > 0 ? categoryId[0] : '';
}

/**
 * JSON 데이터를 API 응답 형식으로 변환
 */
function transformDisclosureData(data: DisclosureJsonData, exchange: ExchangeCode): Disclosure[] {
  if (!data?.data?.getDisclosure || !Array.isArray(data.data.getDisclosure)) {
    return [];
  }

  return data.data.getDisclosure.map((item) => {
    const topics = item.analysisDetails.topicKor.split(',').map((topic) => topic.trim());
    const categoryId = extractCategoryId(item.details.categoryId);
    const categoryName = getCategoryName(categoryId, exchange);

    const secName = item.details.secName?.[0] || '';
    const secCode = item.details.secCode?.[0] || '';

    return {
      id: item.id,
      date: item.dataDate,
      secName: `${item.korName} (${secName})`,
      secCode,
      exchange,
      topics,
      category: categoryName,
      title: item.analysisDetails.summarizeTinyKor,
      content: item.analysisDetails.summarizeLongKor,
      originalUrl: item.details.fileLink,
    };
  });
}

/**
 * 날짜 필터링 함수
 */
function filterByDateRange(
  disclosures: Disclosure[],
  startDate?: string,
  endDate?: string
): Disclosure[] {
  if (!startDate && !endDate) return disclosures;

  return disclosures.filter((disclosure) => {
    if (startDate && endDate) {
      return (
        DateUtils.isSameOrAfterDay(disclosure.date, startDate) &&
        DateUtils.isSameOrBeforeDay(disclosure.date, endDate)
      );
    }

    if (startDate) {
      return DateUtils.isSameOrAfterDay(disclosure.date, startDate);
    }

    if (endDate) {
      return DateUtils.isSameOrBeforeDay(disclosure.date, endDate);
    }

    return true;
  });
}

/**
 * 날짜 기준 내림차순 정렬 (최신순)
 */
function sortByDateDescending(disclosures: Disclosure[]): Disclosure[] {
  return [...disclosures].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 페이지네이션 적용
 */
function applyPagination(
  disclosures: Disclosure[],
  page: number
): { paginatedData: Disclosure[]; hasMore: boolean } {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  return {
    paginatedData: disclosures.slice(startIndex, endIndex),
    hasMore: endIndex < disclosures.length,
  };
}

/**
 * 거래소별 공시 데이터 가져오기
 */
function getDisclosuresByExchange(exchange: Exchange): Disclosure[] {
  let disclosures: Disclosure[] = [];

  try {
    if (exchange === 'SHENZHEN' || exchange === 'ALL') {
      const shenzhenDisclosures = transformDisclosureData(
        shenzhenData as DisclosureJsonData,
        'SHENZHEN'
      );
      disclosures = [...disclosures, ...shenzhenDisclosures];
    }

    if (exchange === 'HONGKONG' || exchange === 'ALL') {
      const hongkongDisclosures = transformDisclosureData(
        hongkongData as DisclosureJsonData,
        'HONGKONG'
      );
      disclosures = [...disclosures, ...hongkongDisclosures];
    }

    return disclosures;
  } catch (error) {
    console.error('Error fetching disclosure data:', error);
    return [];
  }
}

/**
 * GET 요청 처리
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 요청 파라미터 추출
    const { exchange, startDate, endDate, page } = extractQueryParams(request);

    // 거래소별 데이터 가져오기
    const allDisclosures = getDisclosuresByExchange(exchange);

    // 날짜 필터링 적용
    const filteredByDate = filterByDateRange(allDisclosures, startDate, endDate);

    // 정렬: 최신 데이터가 먼저 나오도록
    const sortedDisclosures = sortByDateDescending(filteredByDate);

    // 페이지네이션 적용
    const { paginatedData, hasMore } = applyPagination(sortedDisclosures, page);

    return NextResponse.json({
      disclosures: paginatedData,
      hasMore,
      total: sortedDisclosures.length,
    });
  } catch (error) {
    console.error('Error processing disclosure request:', error);
    return NextResponse.json(
      {
        disclosures: [],
        hasMore: false,
        total: 0,
        error: 'Failed to process disclosure request',
      },
      { status: 500 }
    );
  }
}
