import { useState, useEffect } from "react";
import type { Property, FilterState, MapState } from "@/shared/types";
import {
  generateMockProperties,
  filterProperties,
} from "@/shared/lib/mock-data";
import { DEFAULT_LOCATION } from "@/shared/const";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { NaverMapView } from "@/components/NaverMapView";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { Header } from "@/shared/ui/Header";
import { EmptyState } from "@/components/EmptyState";

export default function PropertySearch() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0,
    priceMax: 1000000000,
    areaMin: 0,
    areaMax: 300,
    types: ["apartment", "villa", "townhouse"],
    transactionType: "sale",
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >();
  const [mapState, setMapState] = useState<MapState>({
    center: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
    zoom: DEFAULT_LOCATION.zoom,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<
    string | undefined
  >();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const [transactionType, setTransactionType] = useState<
    "sale" | "rent" | "lease"
  >("sale");
  const [sortType, setSortType] = useState<
    "nearby" | "price-low" | "price-high"
  >("nearby");

  // 초기 데이터 로드
  useEffect(() => {
    const mockData = generateMockProperties(30);
    setProperties(mockData);
    setFilteredProperties(mockData);
  }, []);

  // 필터 변경 처리
  useEffect(() => {
    let filtered = filterProperties(properties, {
      ...filters,
      transactionType,
    });

    // 정렬 적용
    if (sortType === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortType === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }
    // 'nearby'는 기본 순서 유지

    setFilteredProperties(filtered);
  }, [filters, properties, transactionType, sortType]);

  // 매물 선택 시 지도 중심 이동
  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
    setMapState({
      center: { lat: property.latitude, lng: property.longitude },
      zoom: 17,
    });
    setDetailModalOpen(true);
  };

  // 매물 카드 호버 시 지도에 강조 표시
  const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
    if (isHovering) {
      setHoveredPropertyId(propertyId);
    } else {
      setHoveredPropertyId(undefined);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <Header
        transactionType={transactionType}
        onTransactionTypeChange={setTransactionType}
      />

      {/* 메인 콘텐츠 - 좌측 목록, 우측 지도 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바 - 매물 목록 */}
        <div className="w-full md:w-96 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          {/* 검색바 */}
          <SearchBar
            onLocationChange={location => {
              // 위치 변경 시 필터링 로직 추가 가능
            }}
            onSortChange={sort => setSortType(sort)}
          />

          {/* 매물 목록 */}
          <div className="flex-1 overflow-y-auto">
            {filteredProperties.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredProperties.map(property => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    onMouseEnter={() => handlePropertyHover(property.id, true)}
                    onMouseLeave={() => handlePropertyHover(property.id, false)}
                  >
                    <PropertyCard
                      property={property}
                      isSelected={selectedPropertyId === property.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState />
              </div>
            )}
          </div>

          {/* 매물 개수 표시 */}
          <div className="shrink-0 p-4 border-t border-gray-200 text-sm text-gray-600">
            {filteredProperties.length}개의 매물을 찾았습니다.
          </div>
        </div>

        {/* 우측 지도 */}
        <div className="hidden md:flex flex-1 bg-gray-100">
          <NaverMapView
            center={mapState.center}
            zoom={mapState.zoom}
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onPropertySelect={handlePropertySelect}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
        />
      )}
    </div>
  );
}
