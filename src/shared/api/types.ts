export interface UserInfoResponse {
  email: string;
  nickname: string;
}

export interface AddressDocumentResponse {
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
}

export interface AddressSearchResponse {
  documents: AddressDocumentResponse[];
}

export interface AddressResolveResponse extends AddressDocumentResponse {
  detailAddress?: string | null;
  buildingManagementNumber: string;
  postalCode: string;
  administrativeCode: string;
  city: string;
  district: string;
  neighborhood: string;
  buildingName?: string | null;
  isApartment: boolean;
}

export interface PropertyListingResponse {
  id: string;
  title: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  detailAddress?: string | null;
  buildingManagementNumber: string;
  postalCode: string;
  administrativeCode: string;
  city: string;
  district: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  propertyType: "APARTMENT" | "MULTI_FAMILY";
  transactionType?: "RENT" | "LEASE" | null;
  priceManwon?: number | null;
  depositAmountManwon?: number | null;
  monthlyRentManwon?: number | null;
  exclusiveAreaM2?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  createdAt: string;
}

export interface AverageSalePriceResponse {
  query?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  averageSalePriceManwon?: number | null;
  sampleCount: number;
}

export interface AnalysisRequestCreateRequest {
  property: {
    roadAddress: string;
    jibunAddress: string;
    detailAddress?: string | null;
    buildingManagementNumber: string;
    postalCode: string;
    administrativeCode: string;
    city: string;
    district: string;
    neighborhood: string;
    buildingName?: string | null;
    isApartment: boolean;
    longitude: number;
    latitude: number;
  };
  contractType: "JEONSE" | "MONTHLY_RENT";
  depositAmount: number;
  monthlyRent?: number | null;
  floor: number;
  exclusiveArea: number;
  contractDate: string;
  balanceDate: string;
  expiryDate: string;
}

export interface AnalysisRequestResponse {
  requestId: string;
  property?: PropertyListingResponse;
  contractType?: "JEONSE" | "MONTHLY_RENT";
  depositAmount?: number;
  monthlyRent?: number | null;
  floor?: number;
  exclusiveArea?: number;
  contractDate?: string;
  balanceDate?: string;
  expiryDate?: string;
  status?: string;
  requestedAt?: string;
  completedAt?: string | null;
}

export interface AnalysisStartRequest {
  building: {
    dong: string;
    ho: string;
  };
  registry?: {
    address?: string | null;
    uniqueNum?: string | null;
    type?: string | null;
  };
  rentTradeMonths?: number;
  diagnosisSupplement?: Record<string, unknown>;
}

export interface AnalysisDetailResponse {
  requestId: string;
  property: PropertyListingResponse;
  buildingInfo: {
    name: string;
    address: string;
    buildingManagementNumber: string;
    floor: number;
    totalFloors?: number | null;
    exclusiveAreaM2: number;
    estimatedPropertyValueManwon?: number | null;
  };
  priceHistory: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  registrationSections: Array<{
    title: string;
    records: Array<{
      rank: number;
      purpose: string;
      registrationDate?: string | null;
      registrationCause?: string | null;
      rightsAndNotes: string;
    }>;
  }>;
  buildingLandAnalysis: {
    usage?: string | null;
    dongHo: string;
    illegalBuilding: string;
    warnings: string[];
  };
  overallAnalysis: {
    totalRiskScore?: number | null;
    priceScore?: number | null;
    registrationScore?: number | null;
    buildingLandScore?: number | null;
    warningMessages: string[];
  };
}

export interface ReminderCreateRequest {
  reminderType: "BEFORE_BALANCE" | "BEFORE_EXPIRY";
  remindDate: string;
  channel: "PUSH" | "EMAIL";
}
