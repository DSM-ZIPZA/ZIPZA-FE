import type { Property } from "@/shared/types";
import { formatPrice, formatArea } from "@/shared/lib/format";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
      className={twMerge(
        clsx(
          "flex items-start justify-between gap-4 py-4 px-4 border-b border-gray-300 transition-all duration-200 cursor-pointer hover:bg-gray-100",
          isSelected && "bg-gray-200"
        )
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="font-bold text-base text-black">{property.title}</h3>
        </div>
        <p className="text-sm text-gray-700 mb-1">
          {formatArea(property.area)}
          {property.floor ? ` · ${property.floor}층` : ""}
          {property.totalFloors ? ` / ${property.totalFloors}층` : ""}
        </p>
        <p className="text-xs text-gray-600">{property.address}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-bold text-base text-black">
          {formatPrice(property.deposit ?? property.price)}
        </p>
        {!!property.monthlyRent && (
          <p className="text-xs text-gray-500">
            월세 {formatPrice(property.monthlyRent)}
          </p>
        )}
      </div>
    </div>
  );
}
