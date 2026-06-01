import { useCallback, useMemo, useState } from "react";
import type { Property, MapState } from "@/shared/types";
import { DEFAULT_LOCATION } from "@/shared/const";
import { KakaoMapView } from "@/components/map/KakaoMapView";
import { Header } from "@/shared/ui/Header";
import { PropertyAnalysisDrawer } from "@/components/analysis/PropertyAnalysisDrawer";
import { LoginModal } from "@/shared/ui/LoginModal";
import { useAuth } from "@/shared/contexts/AuthContext";
import { VisibleResidentialBuildingList } from "@/components/search/VisibleResidentialBuildingList";
import { toWon } from "@/shared/api/client";
import { zipzaApi } from "@/shared/api/zipza";

function applyTransactionType(
  building: Property,
  transactionType: "rent" | "lease"
): Property {
  return {
    ...building,
    transactionType,
  };
}

export default function PropertySearch() {
  const { user } = useAuth();
  const [visibleBuildings, setVisibleBuildings] = useState<Property[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Property | null>(null);
  const [mapState] = useState<MapState>({
    center: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
    zoom: DEFAULT_LOCATION.zoom,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"rent" | "lease">(
    "lease"
  );

  const mapBuildings = useMemo(
    () =>
      visibleBuildings.map(building =>
        applyTransactionType(building, transactionType)
      ),
    [visibleBuildings, transactionType]
  );

  const handleVisibleBuildingsChange = useCallback(
    (buildings: Property[]) => {
      setVisibleBuildings(
        buildings.map(building => ({
          ...building,
          averageSalePriceStatus: user ? "loading" : "empty",
        }))
      );

      if (!user) return;

      buildings.forEach(building => {
        zipzaApi
          .getAverageSalePrice({
            query: building.roadAddress || building.jibunAddress || building.address || building.title,
            latitude: building.latitude,
            longitude: building.longitude,
            radiusMeters: 250,
          })
          .then(response => {
            const price = response.averageSalePriceManwon
              ? toWon(response.averageSalePriceManwon)
              : undefined;
            setVisibleBuildings(current =>
              current.map(item =>
                item.id === building.id
                  ? {
                      ...item,
                      averageSalePrice: price,
                      averageSalePriceStatus: price ? "ready" : "empty",
                    }
                  : item
              )
            );
          })
          .catch(() => {
            setVisibleBuildings(current =>
              current.map(item =>
                item.id === building.id
                  ? { ...item, averageSalePriceStatus: "empty" }
                  : item
              )
            );
          });
      });
    },
    [user]
  );

  const handleBuildingSelect = async (building: Property) => {
    let target = applyTransactionType(building, transactionType);
    setSelectedTarget(target);
    setDrawerOpen(true);

    try {
      const resolved = await zipzaApi.resolveAddress(
        building.roadAddress || building.jibunAddress || building.address
      );
      target = {
        ...target,
        roadAddress: resolved.roadAddress,
        jibunAddress: resolved.jibunAddress,
        detailAddress: resolved.detailAddress ?? undefined,
        buildingManagementNumber: resolved.buildingManagementNumber,
        postalCode: resolved.postalCode,
        administrativeCode: resolved.administrativeCode,
        city: resolved.city,
        district: resolved.district,
        neighborhood: resolved.neighborhood,
        isApartment: resolved.isApartment,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
      };
      setSelectedTarget(target);
    } catch {
      setSelectedTarget(target);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {!user && <LoginModal />}
      <Header
        transactionType={transactionType}
        onTransactionTypeChange={type => {
          if (type === "sale") return;
          setTransactionType(type);
          setSelectedTarget(prev =>
            prev ? applyTransactionType(prev, type) : prev
          );
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-96 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          <VisibleResidentialBuildingList
            buildings={mapBuildings}
            selectedBuildingId={selectedTarget?.id}
            onSelect={handleBuildingSelect}
          />
        </div>

        <div className="hidden md:flex flex-1 bg-gray-100">
          <KakaoMapView
            center={mapState.center}
            zoom={mapState.zoom}
            properties={mapBuildings}
            selectedPropertyId={selectedTarget?.id}
            onPropertySelect={handleBuildingSelect}
            discoverResidentialBuildings
            onVisibleBuildingsChange={handleVisibleBuildingsChange}
            className="w-full h-full"
          />
        </div>
      </div>

      <PropertyAnalysisDrawer
        property={selectedTarget}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sidebarWidth={384}
      />
    </div>
  );
}
