import { apiRequest, m2ToPyeong, toWon } from "./client";
import type {
  AddressSearchResponse,
  AddressResolveResponse,
  AnalysisDetailResponse,
  AnalysisRequestCreateRequest,
  AnalysisRequestResponse,
  AnalysisStartRequest,
  AverageSalePriceResponse,
  ReminderCreateRequest,
  PropertyListingResponse,
  UserInfoResponse,
} from "./types";
import type { Property, PropertyDetail, TransactionType } from "@/shared/types";

export const zipzaApi = {
  me: () => apiRequest<UserInfoResponse>("/api/users/me"),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "DELETE" }),
  searchAddress: (query: string) =>
    apiRequest<AddressSearchResponse>(
      `/api/address/search?query=${encodeURIComponent(query)}`
    ),
  resolveAddress: (query: string) =>
    apiRequest<AddressResolveResponse>(
      `/api/address/resolve?query=${encodeURIComponent(query)}`
    ),
  getProperties: (params: {
    lat?: number;
    lng?: number;
    radiusMeters?: number;
    query?: string;
    transactionType?: string;
    depositMin?: number;
    depositMax?: number;
    monthlyRentMin?: number;
    monthlyRentMax?: number;
    sort?: string;
  }) => {
    const search = new URLSearchParams();
    if (params.lat != null) search.set("lat", String(params.lat));
    if (params.lng != null) search.set("lng", String(params.lng));
    if (params.radiusMeters != null)
      search.set("radiusMeters", String(params.radiusMeters));
    if (params.query) search.set("query", params.query);
    if (params.transactionType) search.set("transactionType", params.transactionType);
    if (params.depositMin != null) search.set("depositMin", String(params.depositMin));
    if (params.depositMax != null) search.set("depositMax", String(params.depositMax));
    if (params.monthlyRentMin != null)
      search.set("monthlyRentMin", String(params.monthlyRentMin));
    if (params.monthlyRentMax != null)
      search.set("monthlyRentMax", String(params.monthlyRentMax));
    if (params.sort) search.set("sort", params.sort);
    return apiRequest<PropertyListingResponse[]>(
      `/api/properties${search.size ? `?${search}` : ""}`
    );
  },
  getAverageSalePrice: (params: {
    query?: string;
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.query) search.set("query", params.query);
    if (params.latitude != null) search.set("latitude", String(params.latitude));
    if (params.longitude != null) search.set("longitude", String(params.longitude));
    if (params.radiusMeters != null)
      search.set("radiusMeters", String(params.radiusMeters));
    return apiRequest<AverageSalePriceResponse>(
      `/api/property-prices/average-sale${search.size ? `?${search}` : ""}`
    );
  },
  createAnalysisRequest: (body: AnalysisRequestCreateRequest) =>
    apiRequest<AnalysisRequestResponse>("/api/analysis-requests", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  startAnalysis: (requestId: string, body: AnalysisStartRequest) =>
    apiRequest<unknown>(`/api/analysis-requests/${requestId}/analysis/start`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getAnalysisDetail: (requestId: string) =>
    apiRequest<AnalysisDetailResponse>(
      `/api/analysis-requests/${requestId}/property-detail`
    ),
  getAnalysisRequests: () =>
    apiRequest<AnalysisRequestResponse[]>("/api/analysis-requests"),
  createReminder: (requestId: string, body: ReminderCreateRequest) =>
    apiRequest<unknown>(`/api/analysis-requests/${requestId}/reminders`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export function listingToProperty(dto: PropertyListingResponse): Property {
  const transactionType = dto.transactionType === "RENT" ? "rent" : "lease";
  return {
    id: dto.id,
    title: dto.title || dto.address,
    description: dto.address,
    type: dto.propertyType === "APARTMENT" ? "apartment" : "villa",
    transactionType,
    price: toWon(dto.priceManwon ?? dto.depositAmountManwon ?? 0),
    deposit: toWon(dto.depositAmountManwon ?? dto.priceManwon ?? 0),
    monthlyRent: toWon(dto.monthlyRentManwon ?? 0),
    area: m2ToPyeong(dto.exclusiveAreaM2),
    exclusiveAreaM2: dto.exclusiveAreaM2 ?? 0,
    rooms: 0,
    bathrooms: 0,
    floor: dto.floor ?? 0,
    totalFloors: dto.totalFloors ?? dto.floor ?? 0,
    address: dto.address,
    roadAddress: dto.roadAddress,
    jibunAddress: dto.jibunAddress,
    detailAddress: dto.detailAddress ?? undefined,
    buildingManagementNumber: dto.buildingManagementNumber,
    postalCode: dto.postalCode,
    administrativeCode: dto.administrativeCode,
    city: dto.city,
    district: dto.district,
    neighborhood: dto.neighborhood,
    isApartment: dto.propertyType === "APARTMENT",
    latitude: dto.latitude,
    longitude: dto.longitude,
    images: [],
    features: [],
    contact: { name: "", phone: "" },
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  };
}

export function transactionToContractType(
  transactionType: TransactionType
): "JEONSE" | "MONTHLY_RENT" {
  return transactionType === "rent" ? "MONTHLY_RENT" : "JEONSE";
}

export function detailToPropertyDetail(
  detail: AnalysisDetailResponse
): PropertyDetail {
  const property = listingToProperty(detail.property);
  return {
    id: detail.requestId,
    name: detail.buildingInfo.name,
    price: property.price,
    dong: "",
    ho: "",
    deposit: property.deposit ?? property.price,
    monthlyRent: property.monthlyRent ?? 0,
    address: detail.buildingInfo.address,
    buildingNumber: detail.buildingInfo.buildingManagementNumber,
    area: detail.buildingInfo.exclusiveAreaM2,
    avgSalePrice: toWon(detail.buildingInfo.estimatedPropertyValueManwon ?? 0),
    priceHistory: detail.priceHistory,
    registrationAnalysis: detail.registrationSections.map(section => ({
      title: section.title,
      records: section.records.map(record => ({
        rank: record.rank,
        purpose: record.purpose,
        registrationDate: record.registrationDate ?? "",
        registrationNumber: "",
        registrationCause: record.registrationCause ?? "",
        rightsAndNotes: record.rightsAndNotes,
      })),
    })),
    buildingLandAnalysis: {
      rentalInfo: {
        usage: detail.buildingLandAnalysis.usage ?? "-",
        dongHo: detail.buildingLandAnalysis.dongHo || "-",
        illegalBuilding: detail.buildingLandAnalysis.illegalBuilding,
      },
    },
    overallAnalysis: {
      rentalInfo: {
        totalRiskScore: detail.overallAnalysis.totalRiskScore ?? 0,
        priceScore: detail.overallAnalysis.priceScore ?? 0,
        registrationScore: detail.overallAnalysis.registrationScore ?? 0,
        buildingLandScore: detail.overallAnalysis.buildingLandScore ?? 0,
        warningMessages: detail.overallAnalysis.warningMessages,
      },
    },
  };
}
