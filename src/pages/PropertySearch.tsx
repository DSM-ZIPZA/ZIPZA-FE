import { useCallback, useMemo, useRef, useState } from "react";
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

const AVERAGE_PRICE_CONCURRENCY = 4;

function getAverageSalePriceKey(building: Property) {
  const address =
    building.roadAddress ||
    building.jibunAddress ||
    building.address ||
    building.title;
  return [
    address.trim(),
    Number.isFinite(building.latitude) ? building.latitude.toFixed(5) : "",
    Number.isFinite(building.longitude) ? building.longitude.toFixed(5) : "",
  ].join("|");
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  let index = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const item = items[index++];
        await worker(item);
      }
    }
  );
  await Promise.all(workers);
}

export default function PropertySearch() {
  const { user } = useAuth();
  const [visibleBuildings, setVisibleBuildings] = useState<Property[]>([]);
  const averageSalePriceCache = useRef(
    new Map<string, { price?: number; status: "ready" | "empty" }>()
  );
  const averageSalePriceInFlight = useRef(new Set<string>());
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
      const uniqueBuildings = Array.from(
        new Map(
          buildings.map(building => [
            getAverageSalePriceKey(building),
            building,
          ])
        ).values()
      );

      setVisibleBuildings(
        uniqueBuildings.map(building => {
          const cacheKey = getAverageSalePriceKey(building);
          const cached = averageSalePriceCache.current.get(cacheKey);
          return {
            ...building,
            averageSalePrice: cached?.price,
            averageSalePriceStatus: user
              ? (cached?.status ?? "loading")
              : "empty",
          };
        })
      );

      if (!user) return;

      const targets = uniqueBuildings.filter(building => {
        const cacheKey = getAverageSalePriceKey(building);
        return (
          !averageSalePriceCache.current.has(cacheKey) &&
          !averageSalePriceInFlight.current.has(cacheKey)
        );
      });

      targets.forEach(building => {
        averageSalePriceInFlight.current.add(getAverageSalePriceKey(building));
      });

      void runWithConcurrency(
        targets,
        AVERAGE_PRICE_CONCURRENCY,
        async building => {
          const cacheKey = getAverageSalePriceKey(building);
          try {
            const response = await zipzaApi.getAverageSalePrice({
              query:
                building.roadAddress ||
                building.jibunAddress ||
                building.address ||
                building.title,
              buildingName: building.title,
              isApartment:
                building.isApartment ?? building.type === "apartment",
              latitude: building.latitude,
              longitude: building.longitude,
              radiusMeters: 250,
              months: 12,
            });
            const price = response.averageSalePriceManwon
              ? toWon(response.averageSalePriceManwon)
              : undefined;
            const result = {
              price,
              status: price ? "ready" : "empty",
            } satisfies { price?: number; status: "ready" | "empty" };
            averageSalePriceCache.current.set(cacheKey, result);
            setVisibleBuildings(current =>
              current.map(item =>
                getAverageSalePriceKey(item) === cacheKey
                  ? {
                      ...item,
                      averageSalePrice: price,
                      averageSalePriceStatus: result.status,
                    }
                  : item
              )
            );
          } catch {
            const result = { status: "empty" } satisfies {
              status: "empty";
            };
            averageSalePriceCache.current.set(cacheKey, result);
            setVisibleBuildings(current =>
              current.map(item =>
                getAverageSalePriceKey(item) === cacheKey
                  ? { ...item, averageSalePriceStatus: "empty" }
                  : item
              )
            );
          } finally {
            averageSalePriceInFlight.current.delete(cacheKey);
          }
        }
      );
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
