import { NextRequest, NextResponse } from 'next/server';
import shenzhenData from '@/data/shenzhen.json';
import hongkongData from '@/data/hongkong.json';
import { Disclosure, Exchange, ExchangeCode } from '@/types/common';
import DateUtils from '@/utils/dateUtils';
import { getCategoryName } from '@/data/categories';

// 페이지당 아이템 수
const ITEMS_PER_PAGE = 10;

// JSON 데이터 타입 정의
type DisclosureJsonItem = {
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
};

type DisclosureJsonData = {
  data: {
    getDisclosure: DisclosureJsonItem[];
  };
};

// JSON 데이터를 API 응답 형식으로 변환
function transformDisclosureData(data: DisclosureJsonData, exchange: ExchangeCode): Disclosure[] {
  if (!data?.data?.getDisclosure || !Array.isArray(data.data.getDisclosure)) {
    return [];
  }

  return data.data.getDisclosure.map((item) => {
    const topics = item.analysisDetails.topicKor.split(',');

    const categoryId =
      typeof item.details.categoryId === 'string'
        ? item.details.categoryId
        : Array.isArray(item.details.categoryId) && item.details.categoryId.length > 0
        ? item.details.categoryId[0]
        : '';

    // 카테고리 ID를 한글 이름으로 변환
    const categoryName = getCategoryName(categoryId, exchange);

    return {
      id: item.id,
      date: item.dataDate,
      stockName: item.korName,
      stockCode: Array.isArray(item.details.secCode) ? item.details.secCode[0] : '',
      exchange,
      topics,
      category: categoryName,
      title: item.analysisDetails.summarizeTinyKor,
      content: item.analysisDetails.summarizeLongKor,
      originalUrl: item.details.fileLink,
    };
  });
}

// 날짜 필터링 함수
function filterByDateRange(
  disclosures: Disclosure[],
  startDate?: string,
  endDate?: string
): Disclosure[] {
  if (!startDate && !endDate) return disclosures;

  return disclosures.filter((disclosure) => {
    // 날짜 비교를 위해 dateUtils의 함수 사용
    if (startDate && endDate) {
      // 시작일과 종료일 모두 있는 경우
      return (
        DateUtils.isSameOrAfterDay(disclosure.date, startDate) &&
        DateUtils.isSameOrBeforeDay(disclosure.date, endDate)
      );
    } else if (startDate) {
      // 시작일만 있는 경우
      return DateUtils.isSameOrAfterDay(disclosure.date, startDate);
    } else if (endDate) {
      // 종료일만 있는 경우
      return DateUtils.isSameOrBeforeDay(disclosure.date, endDate);
    }

    return true;
  });
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  // URL 파라미터 추출
  const searchParams = request.nextUrl.searchParams;
  const exchange = (searchParams.get('exchange') as Exchange) || 'ALL';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const page = Number(searchParams.get('page')) || 1;

  // 데이터 변환
  let allDisclosures: Disclosure[] = [];

  // 거래소 필터링
  if (exchange === 'SHENZHEN' || exchange === 'ALL') {
    const shenzhenDisclosures = transformDisclosureData(
      shenzhenData as DisclosureJsonData,
      'SHENZHEN'
    );
    allDisclosures = [...allDisclosures, ...shenzhenDisclosures];
  }

  if (exchange === 'HONGKONG' || exchange === 'ALL') {
    const hongkongDisclosures = transformDisclosureData(
      hongkongData as DisclosureJsonData,
      'HONGKONG'
    );
    allDisclosures = [...allDisclosures, ...hongkongDisclosures];
  }

  // 날짜 필터링 적용
  const filteredByDate = filterByDateRange(allDisclosures, startDate, endDate);

  // 정렬: 최신 데이터가 먼저 나오도록
  const sortedDisclosures = filteredByDate.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 페이지네이션 적용
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDisclosures = sortedDisclosures.slice(startIndex, endIndex);

  // 더 불러올 데이터가 있는지 확인
  const hasMore = endIndex < sortedDisclosures.length;

  return NextResponse.json({
    disclosures: paginatedDisclosures,
    hasMore,
    total: sortedDisclosures.length,
  });
}
