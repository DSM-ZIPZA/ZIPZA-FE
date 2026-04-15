/**
 * Mock Data Generator for ZIPZA Real Estate Platform
 * FSD Architecture: Shared Layer - Utilities
 */

import type { PropertyDetail } from "../types";
import { Property } from "../types";
import { PROPERTY_TYPES, TRANSACTION_TYPES } from "../const";
import type { TransactionType } from "../types";

// 유성구 신성동 주변 좌표 (기본 36.3519, 127.3845)
const AREA_BOUNDS = {
  minLat: 36.34,
  maxLat: 36.36,
  minLng: 127.37,
  maxLng: 127.4,
};

// 아파트 이름들
const APARTMENT_NAMES = [
  "대림두레아파트",
  "삼성한솔아파트",
  "현대아파트",
  "우성아파트",
  "신성동 래미안",
  "신성동 푸르지오",
  "신성동 자이",
  "신성동 힐스테이트",
  "신성동 롯데캐슬",
  "신성동 한라비발디",
];

// 주소들
const ADDRESSES = [
  "대전시 유성구 신성동 123-1",
  "대전시 유성구 신성동 456-2",
  "대전시 유성구 신성동 789-3",
  "대전시 유성구 신성동 234-4",
  "대전시 유성구 신성동 567-5",
  "대전시 유성구 신성동 890-6",
  "대전시 유성구 신성동 321-7",
  "대전시 유성구 신성동 654-8",
  "대전시 유성구 신성동 987-9",
  "대전시 유성구 신성동 111-10",
];

// 연락처 정보
const CONTACTS = [
  { name: "김부동산", phone: "010-1234-5678" },
  { name: "이중개소", phone: "010-2345-6789" },
  { name: "박공인중개사", phone: "010-3456-7890" },
  { name: "최부동산", phone: "010-4567-8901" },
  { name: "정중개소", phone: "010-5678-9012" },
];

// 특징들
const FEATURES = [
  "주차 가능",
  "엘리베이터",
  "보안 시스템",
  "커뮤니티 시설",
  "경비실",
  "CCTV",
  "반려동물 가능",
  "전세 가능",
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
  return (
    Math.floor(getRandomInRange(100000000, 1000000000) / 10000000) * 10000000
  );
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
        "https://d2xsxph8kpxj0f.cloudfront.net/310519663549133883/PoPvEmydiMPzwYvhxrVwNc/property-card-bg-jiFk2m7CKdfNZkPYJFHc4C.webp",
      ],
      features: [
        getRandomItem(FEATURES),
        getRandomItem(FEATURES),
        getRandomItem(FEATURES),
      ].filter((v, i, a) => a.indexOf(v) === i), // 중복 제거
      contact: getRandomItem(CONTACTS),
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
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
  return properties.filter(property => {
    if (filters.priceMin && property.price < filters.priceMin) return false;
    if (filters.priceMax && property.price > filters.priceMax) return false;
    if (filters.areaMin && property.area < filters.areaMin) return false;
    if (filters.areaMax && property.area > filters.areaMax) return false;
    if (filters.types && !filters.types.includes(property.type)) return false;
    if (
      filters.transactionType &&
      property.transactionType !== filters.transactionType
    )
      return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !property.title.toLowerCase().includes(query) &&
        !property.address.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });
}

export const mockPropertyDetail: PropertyDetail = {
  id: "1",
  name: "대림두레아파트",
  price: 430000000,
  dong: "102",
  ho: "1803",
  deposit: 300000000,
  monthlyRent: 300000,
  managementFee: undefined,
  address: "대전광역시 유성구 장동",
  buildingNumber: "110",
  area: 50,
  avgSalePrice: 350000000,
  priceHistory: [
    { date: "2018-01", open: 65000, high: 70000, low: 63000, close: 68000 },
    { date: "2018-04", open: 68000, high: 72000, low: 66000, close: 70000 },
    { date: "2018-07", open: 70000, high: 75000, low: 69000, close: 73000 },
    { date: "2018-10", open: 76000, high: 78000, low: 71000, close: 73000 },
    { date: "2019-01", open: 73000, high: 77000, low: 70000, close: 71000 },
    { date: "2019-04", open: 71000, high: 75000, low: 68000, close: 74000 },
    { date: "2019-07", open: 74000, high: 80000, low: 73000, close: 79000 },
    { date: "2019-10", open: 79000, high: 84000, low: 77000, close: 82000 },
    { date: "2020-01", open: 82000, high: 88000, low: 80000, close: 86000 },
    { date: "2020-04", open: 86000, high: 90000, low: 79000, close: 80000 },
    { date: "2020-07", open: 80000, high: 92000, low: 78000, close: 91000 },
    { date: "2020-10", open: 91000, high: 100000, low: 89000, close: 98000 },
    { date: "2021-01", open: 98000, high: 108000, low: 96000, close: 105000 },
    { date: "2021-04", open: 105000, high: 112000, low: 103000, close: 110000 },
    { date: "2021-07", open: 110000, high: 118000, low: 108000, close: 115000 },
    { date: "2021-10", open: 115000, high: 120000, low: 110000, close: 112000 },
    { date: "2022-01", open: 112000, high: 118000, low: 108000, close: 116000 },
    { date: "2022-04", open: 116000, high: 124000, low: 114000, close: 122000 },
    { date: "2022-07", open: 122000, high: 130000, low: 119000, close: 127000 },
    { date: "2022-10", open: 127000, high: 135000, low: 124000, close: 132000 },
    { date: "2023-01", open: 132000, high: 138000, low: 129000, close: 135000 },
    { date: "2023-04", open: 135000, high: 140000, low: 132000, close: 138000 },
    { date: "2023-07", open: 138000, high: 142000, low: 135000, close: 140000 },
    { date: "2023-10", open: 140000, high: 144000, low: 138000, close: 142500 },
  ],
  registrationAnalysis: [
    {
      title: "표제부",
      records: [
        {
          rank: 1,
          purpose: "소유권이전",
          registrationDate: "2002년 7월 7일 제28415호",
          registrationNumber: "제28415호",
          registrationCause: "2002년 7월 6일 매매",
          rightsAndNotes:
            "소유자 강은찬 320310-1532310 서울특별시 종로구 신영동 150-1",
        },
        {
          rank: 2,
          purpose: "가처분",
          registrationDate: "2003년 1월 13일 제13972호",
          registrationNumber: "제13972호",
          registrationCause:
            "2003년 1월 7일 부산지방법원의 가처분 결정 (2002카합2848)",
          rightsAndNotes:
            "피보전권리 소유권이전등기말소청구권 채권자 이율남 520120-1312757 매매 금지사항 매매, 증여, 양도, 저당권, 전세권 임차권의 설정 그 밖에 일체의 처분행위",
        },
        {
          rank: 3,
          purpose: "소유권이전",
          registrationDate: "2003년 2월 1일 제28416호",
          registrationNumber: "제28416호",
          registrationCause: "2002년 7월 6일 매매",
          rightsAndNotes:
            "소유자 강은찬 320310-1532310 서울특별시 종로구 신영동 150-1",
        },
      ],
    },
    {
      title: "갑구",
      records: [
        {
          rank: 1,
          purpose: "소유권이전",
          registrationDate: "2002년 7월 7일 제28415호",
          registrationNumber: "제28415호",
          registrationCause: "2002년 7월 6일 매매",
          rightsAndNotes:
            "소유자 강은찬 320310-1532310 서울특별시 종로구 신영동 150-1",
        },
        {
          rank: 2,
          purpose: "가처분",
          registrationDate: "2003년 1월 13일 제13972호",
          registrationNumber: "제13972호",
          registrationCause:
            "2003년 1월 7일 부산지방법원의 가처분 결정 (2002카합2848)",
          rightsAndNotes:
            "피보전권리 소유권이전등기말소청구권 채권자 이율남 520120-1312757",
        },
      ],
    },
    {
      title: "을구",
      records: [
        {
          rank: 1,
          purpose: "근저당권설정",
          registrationDate: "2003년 3월 5일 제30211호",
          registrationNumber: "제30211호",
          registrationCause: "2003년 3월 4일 설정계약",
          rightsAndNotes:
            "채권최고액 금120,000,000원 채무자 강은찬 근저당권자 국민은행",
        },
      ],
    },
  ],
  buildingLandAnalysis: {
    rentalInfo: {
      usage: "다세대주택",
      dongHo: "301호",
      illegalBuilding: "없음",
    },
  },
  overallAnalysis: {
    rentalInfo: {
      totalRiskScore: 80,
      priceScore: 30,
      registrationScore: 30,
      buildingLandScore: 30,
      warningMessages: [
        "보증금이 평균 전세가를 62.3% 대비 22.1%p 높습니다.",
        "보증금이 평균 전세가를 62.3% 대비 22.1%p 높습니다.",
        "보증금이 평균 전세가를 62.3% 대비 22.1%p 높습니다.",
      ],
    },
  },
};
