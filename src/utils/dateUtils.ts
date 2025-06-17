import { format, parse, isValid, isAfter, isEqual, formatISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜 문자열을 Date 객체로 변환
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns Date 객체 또는 유효하지 않은 경우 null
 */
export const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;

  try {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식의 문자열 또는 유효하지 않은 경우 빈 문자열
 */
export const formatDate = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Date 객체를 ISO 문자열로 변환 (YYYY-MM-DD)
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식의 ISO 문자열 또는 유효하지 않은 경우 undefined
 */
export const formatDateToISOString = (date: Date | null | undefined): string | undefined => {
  if (!date || !isValid(date)) return undefined;
  return formatISO(date, { representation: 'date' });
};

/**
 * 한국어 날짜 포맷으로 변환 (YYYY년 MM월 DD일)
 * @param date Date 객체
 * @returns 한국어 날짜 포맷 또는 유효하지 않은 경우 빈 문자열
 */
export const formatDateKorean = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy년 MM월 dd일', { locale: ko });
};

/**
 * 두 날짜 사이의 유효성 검사
 * @param startDate 시작일
 * @param endDate 종료일
 * @returns 유효한 날짜 범위인지 여부
 */
export const isValidDateRange = (startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) return true; // 둘 중 하나라도 없으면 유효하다고 간주

  return (
    isValid(startDate) &&
    isValid(endDate) &&
    (isAfter(endDate, startDate) || isEqual(endDate, startDate))
  );
};

/**
 * 날짜 범위 객체 생성
 * @param startDate 시작일
 * @param endDate 종료일
 * @returns DateRange 객체
 */
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export const createDateRange = (startDate: Date | null, endDate: Date | null): DateRange => {
  return {
    startDate,
    endDate,
  };
};

/**
 * 날짜 범위를 API 요청에 사용할 수 있는 형식으로 변환
 * @param dateRange DateRange 객체
 * @returns API 요청용 날짜 범위 객체
 */
export const formatDateRangeForAPI = (
  dateRange: DateRange
): { startDate?: string; endDate?: string } => {
  return {
    startDate: dateRange.startDate ? formatDateToISOString(dateRange.startDate) : undefined,
    endDate: dateRange.endDate ? formatDateToISOString(dateRange.endDate) : undefined,
  };
};
