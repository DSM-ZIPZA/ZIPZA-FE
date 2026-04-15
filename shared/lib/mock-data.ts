/**
 * Mock Data Generator for ZIPZA Real Estate Platform
 * FSD Architecture: Shared Layer - Utilities
 */

import { Property } from '../types';
import { PROPERTY_TYPES, TRANSACTION_TYPES } from '../const';
import type { TransactionType } from '../types';

// 유성구 신성동 주변 좌표 (기본 36.3519, 127.3845)
const AREA_BOUNDS = {
  minLat: 36.34,
  maxLat: 36.36,
  minLng: 127.37,
  maxLng: 127.40,
};

// 아파트 이름들
const APARTMENT_NAMES = [
  '대림두레아파트',
  '삼성한솔아파트',
  '현대아파트',
  '우성아파트',
  '신성동 래미안',
  '신성동 푸르지오',
  '신성동 자이',
  '신성동 힐스테이트',
  '신성동 롯데캐슬',
  '신성동 한라비발디',
];

// 주소들
const ADDRESSES = [
  '대전시 유성구 신성동 123-1',
  '대전시 유성구 신성동 456-2',
  '대전시 유성구 신성동 789-3',
  '대전시 유성구 신성동 234-4',
  '대전시 유성구 신성동 567-5',
  '대전시 유성구 신성동 890-6',
  '대전시 유성구 신성동 321-7',
  '대전시 유성구 신성동 654-8',
  '대전시 유성구 신성동 987-9',
  '대전시 유성구 신성동 111-10',
];

// 연락처 정보
const CONTACTS = [
  { name: '김부동산', phone: '010-1234-5678' },
  { name: '이중개소', phone: '010-2345-6789' },
  { name: '박공인중개사', phone: '010-3456-7890' },
  { name: '최부동산', phone: '010-4567-8901' },
  { name: '정중개소', phone: '010-5678-9012' },
];

// 특징들
const FEATURES = [
  '주차 가능',
  '엘리베이터',
  '보안 시스템',
  '커뮤니티 시설',
  '경비실',
  'CCTV',
  '반려동물 가능',
  '전세 가능',
];

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomItem<T>(array: readonly T[] | T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCoordinates() {
  return {
    latitude: getRandomInRange(AREA_BOUNDS.minLat, AREA_BOUNDS.maxLat),
    longitude: getRandomInRange(AREA_BOUNDS.minLng, AREA_BOUNDS.maxLng),
  };
}

function generatePrice(): number {
  // 1억 ~ 10억 사이의 가격
  return Math.floor(getRandomInRange(100000000, 1000000000) / 10000000) * 10000000;
}

function generateArea(): number {
  // 30평 ~ 150평 사이
  return Math.floor(getRandomInRange(30, 150));
}

export function generateMockProperties(count: number = 15): Property[] {
  const properties: Property[] = [];

  for (let i = 0; i < count; i++) {
    const coords = generateCoordinates();
    const property: Property = {
      id: `property-${i + 1}`,
      title: getRandomItem(APARTMENT_NAMES),
      description: `${generateArea()}평의 넓고 쾌적한 주거공간입니다. 신성동 중심에 위치하여 교통이 편리합니다.`,
      type: getRandomItem(Object.values(PROPERTY_TYPES)),
      transactionType: getRandomItem(Object.values(TRANSACTION_TYPES)),
      price: generatePrice(),
      area: generateArea(),
      rooms: Math.floor(getRandomInRange(2, 5)),
      bathrooms: Math.floor(getRandomInRange(1, 3)),
      floor: Math.floor(getRandomInRange(1, 20)),
      totalFloors: Math.floor(getRandomInRange(20, 30)),
      address: getRandomItem(ADDRESSES),
      latitude: coords.latitude,
      longitude: coords.longitude,
      images: [
        'https://d2xsxph8kpxj0f.cloudfront.net/310519663549133883/PoPvEmydiMPzwYvhxrVwNc/property-card-bg-jiFk2m7CKdfNZkPYJFHc4C.webp',
      ],
      features: [
        getRandomItem(FEATURES),
        getRandomItem(FEATURES),
        getRandomItem(FEATURES),
      ].filter((v, i, a) => a.indexOf(v) === i), // 중복 제거
      contact: getRandomItem(CONTACTS),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    properties.push(property);
  }

  return properties;
}

export function filterProperties(
  properties: Property[],
  filters: {
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    types?: string[];
    searchQuery?: string;
    transactionType?: string;
  }
): Property[] {
  return properties.filter((property) => {
    if (filters.priceMin && property.price < filters.priceMin) return false;
    if (filters.priceMax && property.price > filters.priceMax) return false;
    if (filters.areaMin && property.area < filters.areaMin) return false;
    if (filters.areaMax && property.area > filters.areaMax) return false;
    if (filters.types && !filters.types.includes(property.type)) return false;
    if (filters.transactionType && property.transactionType !== filters.transactionType) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!property.title.toLowerCase().includes(query) &&
          !property.address.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}
