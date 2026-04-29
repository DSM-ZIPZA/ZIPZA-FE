import { useState, useEffect } from "react";
import type { Property, FilterState, MapState } from "@/shared/types";
import {
  generateMockProperties,
  filterProperties,
} from "@/shared/lib/mock-data";
import { DEFAULT_LOCATION } from "@/shared/const";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/search/SearchBar";
import { KakaoMapView } from "@/components/map/KakaoMapView";
import { Header } from "@/shared/ui/Header";
import { EmptyState } from "@/components/search/EmptyState";
import { PropertyAnalysisDrawer } from "@/components/analysis/PropertyAnalysisDrawer";
import { PropertyFilter } from "@/components/PropertyFilter";
import { LoginModal } from "@/shared/ui/LoginModal";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function PropertySearch() {
  const { user } = useAuth();
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
  const [hoveredPropertyId, setHoveredPropertyId] = useState<
    string | undefined
  >();
  const [drawerOpen, setDrawerOpen] = useState(false); // ← 변경
  const selectedProperty =
    properties.find(p => p.id === selectedPropertyId) ?? null;
  const [transactionType, setTransactionType] = useState<
    "sale" | "rent" | "lease"
  >("sale");
  const [sortType, setSortType] = useState<
    "nearby" | "price-low" | "price-high"
  >("nearby");

  useEffect(() => {
    const mockData = generateMockProperties(30);
    setProperties(mockData);
    setFilteredProperties(mockData);
  }, []);

  useEffect(() => {
    let filtered = filterProperties(properties, {
      ...filters,
      transactionType,
    });
    if (sortType === "price-low")
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sortType === "price-high")
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    setFilteredProperties(filtered);
  }, [filters, properties, transactionType, sortType]);

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
    setMapState({
      center: { lat: property.latitude, lng: property.longitude },
      zoom: 17,
    });
    setDrawerOpen(true);
  };

  const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
    setHoveredPropertyId(isHovering ? propertyId : undefined);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {!user && <LoginModal />}
      <Header
        transactionType={transactionType}
        onTransactionTypeChange={setTransactionType}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-96 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          <SearchBar
            onLocationChange={() => {}}
            onAddressSelect={addr => {
              const lat = parseFloat(addr.lat);
              const lng = parseFloat(addr.lon);
              setMapState({ center: { lat, lng }, zoom: 5 });
            }}
            onSortChange={sort => setSortType(sort)}
          />

          <PropertyFilter
            filters={filters}
            onFilterChange={setFilters}
            sortType={sortType}
            onSortChange={setSortType}
          />

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
          <div className="shrink-0 p-4 border-t border-gray-200 text-sm text-gray-600">
            {filteredProperties.length}개의 매물을 찾았습니다.
          </div>
        </div>

        <div className="hidden md:flex flex-1 bg-gray-100">
          <KakaoMapView
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

      <PropertyAnalysisDrawer
        property={selectedProperty}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sidebarWidth={384}
      />
    </div>
  );
}
