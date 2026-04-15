/**
 * Shared Types for ZIPZA Real Estate Platform
 * FSD Architecture: Shared Layer - Types
 */

import { PROPERTY_TYPES, TRANSACTION_TYPES, API_STATUS } from './const';

// 부동산 매물 타입
export type PropertyType = typeof PROPERTY_TYPES[keyof typeof PROPERTY_TYPES];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type ApiStatus = typeof API_STATUS[keyof typeof API_STATUS];

// 부동산 매물 엔티티
export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  area: number; // 평 단위
  rooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  features: string[];
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 필터 상태
export interface FilterState {
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  types: PropertyType[];
  transactionType: TransactionType;
  searchQuery?: string;
}

// 지도 상태
export interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  selectedPropertyId?: string;
}

// API 응답 상태
export interface ApiState<T> {
  status: ApiStatus;
  data?: T;
  error?: string;
}

// 목록 응답
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
