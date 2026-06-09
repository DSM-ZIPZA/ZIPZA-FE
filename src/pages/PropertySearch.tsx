import { useCallback, useMemo, useRef, useState } from "react";
import type { FilterState, Property, MapState } from "@/shared/types";
import { DEFAULT_LOCATION } from "@/shared/const";
import { KakaoMapView } from "@/components/map/KakaoMapView";
import { Header } from "@/shared/ui/Header";
import { PropertyAnalysisDrawer } from "@/components/analysis/PropertyAnalysisDrawer";
import { LoginModal } from "@/shared/ui/LoginModal";
import { useAuth } from "@/shared/contexts/AuthContext";
import { VisibleResidentialBuildingList } from "@/components/search/VisibleResidentialBuildingList";
import { SearchBar, type KakaoAddress } from "@/components/search/SearchBar";
import { toWon } from "@/shared/api/client";
import { zipzaApi } from "@/shared/api/zipza";
import { PropertyFilter } from "@/components/PropertyFilter";

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
type SortType = "nearby" | "price-low" | "price-high";

const INITIAL_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 1000000000,
  areaMin: 0,
  areaMax: 300,
  types: ["apartment", "villa", "townhouse"],
  transactionType: "lease",
};

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
  const [mapState, setMapState] = useState<MapState>({
    center: { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng },
    zoom: DEFAULT_LOCATION.zoom,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"rent" | "lease">(
    "lease"
  );
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortType, setSortType] = useState<SortType>("nearby");

  const moveMapTo = useCallback((lat: number, lng: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (lat === 0 && lng === 0) return;

    setMapState({
      center: { lat, lng },
      zoom: DEFAULT_LOCATION.zoom,
    });
  }, []);

  const handleAddressSelect = useCallback(
    (address: KakaoAddress) => {
      moveMapTo(Number(address.lat), Number(address.lon));
      setVisibleBuildings([]);
      setSelectedTarget(null);
      setDrawerOpen(false);
    },
    [moveMapTo]
  );

  const mapBuildings = useMemo(
    () =>
      visibleBuildings.map(building =>
        applyTransactionType(building, transactionType)
      ),
    [visibleBuildings, transactionType]
  );

  const filteredBuildings = useMemo(() => {
    const next = mapBuildings.filter(building => {
      const deposit =
        transactionType === "lease"
          ? (building.averageSalePrice ??
            building.deposit ??
            building.price ??
            0)
          : (building.deposit ?? building.price ?? 0);
      const monthlyRent = building.monthlyRent ?? 0;

      if (filters.depositMin && deposit < filters.depositMin) return false;
      if (filters.depositMax && deposit > filters.depositMax) return false;
      if (filters.rentMin && monthlyRent < filters.rentMin) return false;
      if (filters.rentMax && monthlyRent > filters.rentMax) return false;
      return true;
    });

    if (sortType === "nearby") return next;
    const getPrice = (building: Property) =>
      transactionType === "rent"
        ? (building.monthlyRent ?? 0)
        : (building.averageSalePrice ??
          building.deposit ??
          building.price ??
          0);
    return [...next].sort((a, b) =>
      sortType === "price-low"
        ? getPrice(a) - getPrice(b)
        : getPrice(b) - getPrice(a)
    );
  }, [filters, mapBuildings, sortType, transactionType]);

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
            transactionType,
            averageSalePrice: cached?.price,
            averageSalePriceStatus: user && transactionType === "lease"
              ? (cached?.status ?? "loading")
              : "empty",
          };
        })
      );

      if (!user || transactionType !== "lease") return;

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
            if (price) {
              averageSalePriceCache.current.set(cacheKey, result);
            } else {
              averageSalePriceCache.current.delete(cacheKey);
            }
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
            averageSalePriceCache.current.delete(cacheKey);
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
    [transactionType, user]
  );

  const handleBuildingSelect = async (building: Property) => {
    let target = applyTransactionType(building, transactionType);
    moveMapTo(target.latitude, target.longitude);
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
      moveMapTo(target.latitude, target.longitude);
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
          setFilters(current => ({
            ...current,
            transactionType: type,
            rentMin: type === "lease" ? undefined : current.rentMin,
            rentMax: type === "lease" ? undefined : current.rentMax,
          }));
          setSelectedTarget(prev =>
            prev ? applyTransactionType(prev, type) : prev
          );
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-96 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          <SearchBar onAddressSelect={handleAddressSelect} />
          <PropertyFilter
            filters={filters}
            onFilterChange={setFilters}
            sortType={sortType}
            onSortChange={setSortType}
          />
          <VisibleResidentialBuildingList
            buildings={filteredBuildings}
            transactionType={transactionType}
            selectedBuildingId={selectedTarget?.id}
            onSelect={handleBuildingSelect}
          />
        </div>

        <div className="hidden md:flex flex-1 bg-gray-100">
          <KakaoMapView
            center={mapState.center}
            zoom={mapState.zoom}
            properties={filteredBuildings}
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
