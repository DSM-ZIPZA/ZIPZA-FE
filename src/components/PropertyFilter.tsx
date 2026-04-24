import { useState } from "react";
import type { FilterState } from "@/shared/types";
import { X } from "lucide-react";

interface PropertyFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortType: "nearby" | "price-low" | "price-high";
  onSortChange: (sort: "nearby" | "price-low" | "price-high") => void;
}

const sortLabels = {
  nearby: "주변매물",
  "price-low": "월세 낮은순",
  "price-high": "월세 높은순",
};

function formatPrice(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
}

export function PropertyFilter({
  filters,
  onFilterChange,
  sortType,
  onSortChange,
}: PropertyFilterProps) {
  const [sortOpen, setSortOpen] = useState(false);

  const [depositMin, setDepositMin] = useState("");
  const [depositMax, setDepositMax] = useState("");
  const [rentMin, setRentMin] = useState("");
  const [rentMax, setRentMax] = useState("");

  const handlePriceInput = (
    field: "depositMin" | "depositMax" | "rentMin" | "rentMax",
    raw: string
  ) => {
    const num = raw.replace(/[^0-9]/g, "");
    const formatted = num ? Number(num).toLocaleString("ko-KR") : "";

    if (field === "depositMin") setDepositMin(formatted);
    if (field === "depositMax") setDepositMax(formatted);
    if (field === "rentMin") setRentMin(formatted);
    if (field === "rentMax") setRentMax(formatted);

    const toWon = (s: string) =>
      s ? Number(s.replace(/,/g, "")) * 10000 : undefined;

    onFilterChange({
      ...filters,
      depositMin: field === "depositMin" ? toWon(formatted) : toWon(depositMin),
      depositMax: field === "depositMax" ? toWon(formatted) : toWon(depositMax),
      rentMin: field === "rentMin" ? toWon(formatted) : toWon(rentMin),
      rentMax: field === "rentMax" ? toWon(formatted) : toWon(rentMax),
    });
  };

  const handleReset = () => {
    setDepositMin("");
    setDepositMax("");
    setRentMin("");
    setRentMax("");
    onFilterChange({
      ...filters,
      depositMin: undefined,
      depositMax: undefined,
      rentMin: undefined,
      rentMax: undefined,
    });
  };

  const hasActiveFilter = depositMin || depositMax || rentMin || rentMax;

  return (
    <div className="border-b border-gray-200 bg-slate-100">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">주변 매물</span>
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>{sortLabels[sortType]}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-36">
              {(["nearby", "price-low", "price-high"] as const).map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    onSortChange(s);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50
                    ${i > 0 ? "border-t border-gray-100" : ""}
                    ${sortType === s ? "font-semibold text-black" : "text-gray-700"}`}
                >
                  {sortLabels[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            필터를 설정해주세요.
          </span>
          {hasActiveFilter && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">보증금</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={depositMin}
                onChange={e => handlePriceInput("depositMin", e.target.value)}
                placeholder="최소"
                className="w-full px-3 py-2 text-sm border bg-white border-gray-200 rounded-lg focus:outline-none focus:border-black placeholder:text-gray-300"
              />
              {depositMin && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                  만원
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={depositMax}
                onChange={e => handlePriceInput("depositMax", e.target.value)}
                placeholder="최대"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black placeholder:text-gray-300"
              />
              {depositMax && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                  만원
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">월세</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={rentMin}
                onChange={e => handlePriceInput("rentMin", e.target.value)}
                placeholder="최소"
                className="w-full px-3 py-2 text-sm border bg-white border-gray-200 rounded-lg focus:outline-none focus:border-black placeholder:text-gray-300"
              />
              {rentMin && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                  만원
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={rentMax}
                onChange={e => handlePriceInput("rentMax", e.target.value)}
                placeholder="최대"
                className="w-full px-3 py-2 text-sm border bg-white border-gray-200 rounded-lg focus:outline-none focus:border-black placeholder:text-gray-300"
              />
              {rentMax && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                  만원
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
