import { useMemo, useState } from "react";
import { Building2, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import type { Property } from "@/shared/types";
import { formatPrice } from "@/shared/lib/format";

interface VisibleResidentialBuildingListProps {
  buildings: Property[];
  selectedBuildingId?: string;
  onSelect: (building: Property) => void;
}

type BuildingTypeFilter = "all" | "apartment" | "villa";
type SortType = "nearby" | "name" | "price-high" | "price-low";

const typeLabels: Record<BuildingTypeFilter, string> = {
  all: "전체",
  apartment: "아파트",
  villa: "주거 건물",
};

const sortLabels: Record<SortType, string> = {
  nearby: "지도순",
  name: "이름순",
  "price-high": "평균전세가 높은순",
  "price-low": "평균전세가 낮은순",
};

function getAverageSalePriceLabel(building: Property) {
  if (building.averageSalePriceStatus === "loading") return "평균전세가 조회 중";
  if (!building.averageSalePrice) return "평균전세가 정보 없음";
  return `평균전세가 ${formatPrice(building.averageSalePrice)}`;
}

export function VisibleResidentialBuildingList({
  buildings,
  selectedBuildingId,
  onSelect,
}: VisibleResidentialBuildingListProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<BuildingTypeFilter>("all");
  const [sortType, setSortType] = useState<SortType>("nearby");
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredBuildings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const next = buildings.filter(building => {
      const address = building.roadAddress || building.jibunAddress || building.address;
      const matchesQuery =
        !normalizedQuery ||
        building.title.toLowerCase().includes(normalizedQuery) ||
        address.toLowerCase().includes(normalizedQuery);
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "apartment" && building.type === "apartment") ||
        (typeFilter === "villa" && building.type !== "apartment");
      return matchesQuery && matchesType;
    });

    if (sortType === "name") {
      return [...next].sort((a, b) => a.title.localeCompare(b.title, "ko"));
    }
    if (sortType === "price-high") {
      return [...next].sort(
        (a, b) => (b.averageSalePrice ?? -1) - (a.averageSalePrice ?? -1)
      );
    }
    if (sortType === "price-low") {
      return [...next].sort(
        (a, b) =>
          (a.averageSalePrice ?? Number.MAX_SAFE_INTEGER) -
          (b.averageSalePrice ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return next;
  }, [buildings, query, sortType, typeFilter]);

  const hasFilter = query || typeFilter !== "all" || sortType !== "nearby";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="건물명, 도로명, 지번 검색"
            className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-9 text-sm outline-none transition-colors focus:border-black"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 bg-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">
              화면에 보이는 주거 건물
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(prev => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-900"
            aria-label="필터"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {filterOpen && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-white p-1">
              {(["all", "apartment", "villa"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium ${
                    typeFilter === type
                      ? "bg-black text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>

            <select
              value={sortType}
              onChange={event => setSortType(event.target.value as SortType)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
            >
              {(["nearby", "name", "price-high", "price-low"] as const).map(
                sort => (
                  <option key={sort} value={sort}>
                    {sortLabels[sort]}
                  </option>
                )
              )}
            </select>

            {hasFilter && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                  setSortType("nearby");
                }}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredBuildings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredBuildings.map(building => {
              const isSelected = building.id === selectedBuildingId;
              return (
                <button
                  key={building.id}
                  type="button"
                  onClick={() => onSelect(building)}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                    isSelected ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {building.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {building.roadAddress || building.jibunAddress || building.address}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">
                        {building.type === "apartment" ? "아파트" : "주거 건물"}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-gray-700">
                        {getAverageSalePriceLabel(building)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-sm text-gray-500">
            조건에 맞는 주거 건물이 없습니다. 지도 위치를 이동하거나 검색/필터를 조정하세요.
          </div>
        )}
      </div>
    </div>
  );
}
