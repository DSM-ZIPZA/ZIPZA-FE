export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

/**
 * ZIPZA Real Estate Platform Constants
 * FSD Architecture: Shared Layer - Constants
 */

// 부동산 매물 타입
export const PROPERTY_TYPES = {
  APARTMENT: "apartment",
  VILLA: "villa",
  TOWNHOUSE: "townhouse",
} as const;

// 거래 유형
export const TRANSACTION_TYPES = {
  SALE: "sale",
  RENT: "rent",
  LEASE: "lease",
} as const;

// 기본 지역 설정 (유성구 신성동)
export const DEFAULT_LOCATION = {
  lat: 36.3519,
  lng: 127.3845,
  name: "유성구 신성동",
  zoom: 3, // 15 → 3 (동네 수준)
} as const;

// 필터 기본값
export const DEFAULT_FILTERS = {
  priceMin: 0,
  priceMax: 1000000000,
  areaMin: 0,
  areaMax: 300,
  types: Object.values(PROPERTY_TYPES),
  transactionType: TRANSACTION_TYPES.SALE,
} as const;

// 가격 범위 옵션 (만원 단위)
export const PRICE_RANGES = [
  { label: "전체", min: 0, max: 1000000000 },
  { label: "1억 이하", min: 0, max: 100000000 },
  { label: "1억 ~ 3억", min: 100000000, max: 300000000 },
  { label: "3억 ~ 5억", min: 300000000, max: 500000000 },
  { label: "5억 이상", min: 500000000, max: 1000000000 },
] as const;

// 면적 범위 옵션
export const AREA_RANGES = [
  { label: "전체", min: 0, max: 300 },
  { label: "50평 이하", min: 0, max: 50 },
  { label: "50 ~ 80평", min: 50, max: 80 },
  { label: "80 ~ 100평", min: 80, max: 100 },
  { label: "100평 이상", min: 100, max: 300 },
] as const;

// 애니메이션 타이밍
export const ANIMATION_TIMING = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
} as const;

// API 응답 상태
export const API_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;
