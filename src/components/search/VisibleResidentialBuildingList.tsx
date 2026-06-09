import { MapPin } from "lucide-react";
import type { Property } from "@/shared/types";
import { formatPrice } from "@/shared/lib/format";

interface VisibleResidentialBuildingListProps {
  buildings: Property[];
  selectedBuildingId?: string;
  onSelect: (building: Property) => void;
}

function getAverageSalePriceLabel(building: Property) {
  if (building.averageSalePriceStatus === "loading")
    return "평균전세가 조회 중";
  if (!building.averageSalePrice) return "평균전세가 정보 없음";
  return `평균전세가 ${formatPrice(building.averageSalePrice)}`;
}

export function VisibleResidentialBuildingList({
  buildings,
  selectedBuildingId,
  onSelect,
}: VisibleResidentialBuildingListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {buildings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {buildings.map(building => {
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
                      {building.roadAddress ||
                        building.jibunAddress ||
                        building.address}
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
            조건에 맞는 주거 건물이 없습니다. 지도 위치를 이동하거나 필터를
            조정하세요.
          </div>
        )}
      </div>
    </div>
  );
}
