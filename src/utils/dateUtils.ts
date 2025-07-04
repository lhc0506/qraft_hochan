import { format, toZonedTime } from 'date-fns-tz';
import { ExchangeCode } from '@/types/common';
import {
  parse,
  isValid,
  formatISO,
  isSameDay as isSameDayFns,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';

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
    logDateError('날짜 파싱 오류', error);
    return null;
  }
};

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식의 문자열 또는 유효하지 않은 경우 빈 문자열
 */
export const convertYYYYMMDDFormat = (date: Date | null): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Date 객체를 ISO 문자열로 변환 (YYYY-MM-DD)
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식의 ISO 문자열 또는 유효하지 않은 경우 undefined
 */
export const convertISOFormat = (date: Date | null): string | undefined => {
  if (!date || !isValid(date)) return undefined;
  return formatISO(date, { representation: 'date' });
};

/**
 * 날짜 범위 타입 정의
 */
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

/**
 * 날짜 범위 객체 생성
 * @param startDate 시작일
 * @param endDate 종료일
 * @returns DateRange 객체
 */
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
    startDate: dateRange.startDate ? convertISOFormat(dateRange.startDate) : undefined,
    endDate: dateRange.endDate ? convertISOFormat(dateRange.endDate) : undefined,
  };
};

/**
 * 두 날짜가 같은 날짜인지 비교 (시간 제외)
 * @param dateLeft 첫 번째 날짜
 * @param dateRight 두 번째 날짜
 * @returns 같은 날짜이면 true
 */
export const isSameDay = (dateLeft: Date | string, dateRight: Date | string): boolean => {
  try {
    const first = normalizeDate(dateLeft);
    const second = normalizeDate(dateRight);
    return isSameDayFns(first, second);
  } catch (error) {
    logDateError('날짜 비교 오류', error);
    return false;
  }
};

/**
 * 첫 번째 날짜가 두 번째 날짜보다 같거나 이후인지 비교
 * @param dateLeft 비교할 날짜
 * @param dateRight 기준 날짜
 * @returns 같거나 이후이면 true
 */
export const isSameOrAfterDay = (dateLeft: Date | string, dateRight: Date | string): boolean => {
  try {
    const first = normalizeDate(dateLeft);
    const second = normalizeDate(dateRight);

    return isSameDayFns(first, second) || isAfter(startOfDay(first), startOfDay(second));
  } catch (error) {
    logDateError('날짜 비교 오류', error);
    return false;
  }
};

/**
 * 첫 번째 날짜가 두 번째 날짜보다 같거나 이전인지 비교
 * @param dateLeft 비교할 날짜
 * @param dateRight 기준 날짜
 * @returns 같거나 이전이면 true
 */
export const isSameOrBeforeDay = (dateLeft: Date | string, dateRight: Date | string): boolean => {
  try {
    const first = normalizeDate(dateLeft);
    const second = normalizeDate(dateRight);

    return isSameDayFns(first, second) || isBefore(startOfDay(first), startOfDay(second));
  } catch (error) {
    logDateError('날짜 비교 오류', error);
    return false;
  }
};

/**
 * 거래소별 시간대 정보
 */
export const EXCHANGE_TIMEZONES: Record<ExchangeCode, string> = {
  SHENZHEN: 'Asia/Shanghai', // 심천 거래소는 중국 시간대 (UTC+8)
  HONGKONG: 'Asia/Hong_Kong', // 홍콩 거래소는 홍콩 시간대 (UTC+8)
};

/**
 * 공시일 포맷팅 (UTC 시간 기준)
 * @param dateString ISO 형식의 날짜 문자열
 * @returns YYYY/MM/DD HH:MM:SS 형식의 문자열
 */
export const convertYYYYMMDDHHMMSSFormat = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (!isValid(date)) return '';

    return format(date, 'yyyy/MM/dd HH:mm:ss');
  } catch (error) {
    logDateError('날짜 포맷팅 오류', error);
    return '';
  }
};

/**
 * 현지시간 포맷팅 (거래소 현지 시간대 기준)
 * @param dateString ISO 형식의 날짜 문자열
 * @param exchange 거래소 코드
 * @returns YYYY/MM/DD HH:MM:SS 형식의 현지 시간 문자열
 */
export const convertLocalTime = (dateString: string, exchange: ExchangeCode): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (!isValid(date)) return '';

    const timezone = EXCHANGE_TIMEZONES[exchange] || 'UTC';
    const zonedDate = toZonedTime(date, timezone);

    return format(zonedDate, 'yyyy/MM/dd HH:mm:ss');
  } catch (error) {
    logDateError('현지 시간 포맷팅 오류', error);
    return '';
  }
};

/**
 * 문자열 또는 Date 객체를 Date 객체로 정규화
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 정규화된 Date 객체
 */
const normalizeDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

/**
 * 날짜 관련 오류 로깅을 위한 유틸리티 함수
 * @param message 오류 메시지
 * @param error 오류 객체
 */
const logDateError = (message: string, error: unknown): void => {
  console.error(`${message}:`, error);
};

// 하위 호환성을 위한 기본 내보내기
const DateUtils = {
  parseDate,
  convertYYYYMMDDFormat,
  convertISOFormat,
  createDateRange,
  formatDateRangeForAPI,
  isSameDay,
  isSameOrAfterDay,
  isSameOrBeforeDay,
  convertYYYYMMDDHHMMSSFormat,
  convertLocalTime,
};

export default DateUtils;
