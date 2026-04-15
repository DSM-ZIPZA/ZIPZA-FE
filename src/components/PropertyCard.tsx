import type { Property } from "@/shared/types";
import { formatPrice, formatArea } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
}

export function PropertyCard({
  property,
  isSelected = false,
  onClick,
  onHover,
}: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={cn(
        "flex items-start justify-between gap-4 py-4 px-4 border-b border-gray-300 transition-all duration-200 cursor-pointer hover:bg-gray-100",
        isSelected && "bg-gray-200"
      )}
    >
      {/* 좌측: 매물 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="font-bold text-base text-black">{property.title}</h3>
        </div>
        <p className="text-sm text-gray-700 mb-1">
          {formatArea(property.area)} · {property.rooms}개 방 ·{" "}
          {property.totalFloors}층
        </p>
        <p className="text-xs text-gray-600">보증금 조정가능 베스트 추천</p>
      </div>

      {/* 우측: 가격 */}
      <div className="shrink-0 text-right">
        <p className="font-bold text-base text-black">
          {formatPrice(property.price)}
        </p>
      </div>
    </div>
  );
}
