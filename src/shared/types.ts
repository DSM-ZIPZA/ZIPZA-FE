/**
 * Shared Types for ZIPZA Real Estate Platform
 * FSD Architecture: Shared Layer - Types
 */

import { PROPERTY_TYPES, TRANSACTION_TYPES, API_STATUS } from "./const";

export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES];
export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
export type ApiStatus = (typeof API_STATUS)[keyof typeof API_STATUS];

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  price: number;
  area: number;
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

export interface FilterState {
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  types: PropertyType[];
  transactionType: TransactionType;
  searchQuery?: string;
}

export interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedPropertyId?: string;
}

export interface ApiState<T> {
  status: ApiStatus;
  data?: T;
  error?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── PropertyDetail 관련 타입 (신규 추가) ───────────────────

export interface RegistrationRecord {
  rank: number;
  purpose: string;
  registrationDate: string;
  registrationNumber: string;
  registrationCause: string;
  rightsAndNotes: string;
}

export interface RegistrationSection {
  title: string;
  records: RegistrationRecord[];
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface BuildingLandInfo {
  rentalInfo: {
    usage: string;
    dongHo: string;
    illegalBuilding: string;
  };
}

export interface OverallAnalysis {
  rentalInfo: {
    totalRiskScore: number;
    priceScore: number;
    registrationScore: number;
    buildingLandScore: number;
    warningMessages: string[];
  };
}

export interface PropertyDetail {
  id: string;
  name: string;
  price: number;
  dong: string;
  ho: string;
  deposit: number;
  monthlyRent: number;
  managementFee?: number;
  address: string;
  buildingNumber: string;
  area: number;
  avgSalePrice: number;
  priceHistory: PricePoint[];
  registrationAnalysis: RegistrationSection[];
  buildingLandAnalysis: BuildingLandInfo;
  overallAnalysis: OverallAnalysis;
}
