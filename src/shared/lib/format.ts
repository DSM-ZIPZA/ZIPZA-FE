/**
 * Formatting Utilities for ZIPZA Real Estate Platform
 * FSD Architecture: Shared Layer - Utilities
 */

/**
 * 가격을 한국 통화 형식으로 변환
 * @param price - 가격 (원 단위)
 * @returns 포매팅된 가격 문자열
 */
export function formatPrice(price: number): string {
  if (price >= 100000000) {
    const eok = Math.floor(price / 100000000);
    const remainder = price % 100000000;
    if (remainder === 0) {
      return `${eok}억`;
    }
    const cheon = Math.floor(remainder / 10000000);
    return `${eok}억 ${cheon}천만`;
  }
  
  if (price >= 10000000) {
    const cheon = Math.floor(price / 10000000);
    const remainder = price % 10000000;
    if (remainder === 0) {
      return `${cheon}천만`;
    }
    return `${cheon}천만 ${Math.floor(remainder / 1000000)}백만`;
  }
  
  if (price >= 1000000) {
    return `${Math.floor(price / 1000000)}백만`;
  }
  
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 면적을 평 단위로 포매팅
 * @param area - 면적 (평 단위)
 * @returns 포매팅된 면적 문자열
 */
export function formatArea(area: number): string {
  return `${area}평`;
}

/**
 * 주소를 간단히 포매팅
 * @param address - 전체 주소
 * @returns 간단한 주소 (마지막 부분만)
 */
export function formatAddress(address: string): string {
  const parts = address.split(' ');
  if (parts.length > 2) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }
  return address;
}

/**
 * 날짜를 상대적 시간으로 포매팅 (예: "2시간 전")
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

/**
 * 전화번호 포매팅
 * @param phone - 전화번호 (하이픈 없음)
 * @returns 포매팅된 전화번호
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
