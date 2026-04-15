import { useState } from "react";
import type { FilterState } from "@/shared/types";
import { PRICE_RANGES, AREA_RANGES, PROPERTY_TYPES } from "@/shared/const";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Search, X } from "lucide-react";

interface PropertyFilterProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export function PropertyFilter({
  onFilterChange,
  initialFilters,
}: PropertyFilterProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      priceMin: 0,
      priceMax: 1000000000,
      areaMin: 0,
      areaMax: 300,
      types: Object.values(PROPERTY_TYPES),
      transactionType: "sale",
      searchQuery: "",
    }
  );

  const [isOpen, setIsOpen] = useState(false);

  const handlePriceRangeClick = (min: number, max: number) => {
    const newFilters = { ...filters, priceMin: min, priceMax: max };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAreaRangeClick = (min: number, max: number) => {
    const newFilters = { ...filters, areaMin: min, areaMax: max };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type as any)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type as any];
    const newFilters = { ...filters, types: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      priceMin: 0,
      priceMax: 1000000000,
      areaMin: 0,
      areaMax: 300,
      types: Object.values(PROPERTY_TYPES),
      transactionType: "sale",
      searchQuery: "",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="매물명, 주소로 검색..."
          value={filters.searchQuery || ""}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 필터 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <span className="font-semibold text-blue-900">필터 옵션</span>
        <span className="text-sm text-blue-700">{isOpen ? "▼" : "▶"}</span>
      </button>

      {/* 필터 패널 */}
      {isOpen && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* 가격 범위 */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">가격대</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePriceRangeClick(range.min, range.max)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    filters.priceMin === range.min &&
                    filters.priceMax === range.max
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-blue-400"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* 면적 범위 */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">면적</h3>
            <div className="grid grid-cols-2 gap-2">
              {AREA_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAreaRangeClick(range.min, range.max)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    filters.areaMin === range.min &&
                    filters.areaMax === range.max
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-blue-400"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* 매물 타입 */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">
              매물 타입
            </h3>
            <div className="space-y-2">
              {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.types.includes(value)}
                    onChange={() => handleTypeToggle(value)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {value === "apartment"
                      ? "아파트"
                      : value === "villa"
                        ? "빌라"
                        : "타운하우스"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 초기화 버튼 */}
          <Button onClick={handleReset} variant="outline" className="w-full">
            <X className="w-4 h-4 mr-2" />
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
