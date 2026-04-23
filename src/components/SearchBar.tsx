import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, MapPin, Loader2 } from "lucide-react";

interface NaverAddress {
  roadAddress: string;
  jibunAddress: string;
  x: string; // 경도
  y: string; // 위도
}

interface SearchBarProps {
  onLocationChange?: (location: string) => void;
  onAddressSelect?: (address: NaverAddress) => void;
  onSortChange?: (sort: "nearby" | "price-low" | "price-high") => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function SearchBar({
  onLocationChange,
  onAddressSelect,
  onSortChange,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NaverAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<
    "nearby" | "price-low" | "price-high"
  >("nearby");
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        // vite 프록시 통해서 호출 → 실제론 naveropenapi.apigw.ntruss.com 로 감
        const res = await fetch(
          `/api/geocode?query=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await res.json();
        setSuggestions(data.addresses ?? []);
        setIsOpen(true);
      } catch (err) {
        console.error("주소 검색 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [debouncedQuery]);

  const handleSelect = (address: NaverAddress) => {
    const display = address.roadAddress || address.jibunAddress;
    setQuery(display);
    setSuggestions([]);
    setIsOpen(false);
    onLocationChange?.(display);
    onAddressSelect?.(address);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onLocationChange?.("");
  };

  const handleSortChange = (sort: "nearby" | "price-low" | "price-high") => {
    setSelectedSort(sort);
    setSortOpen(false);
    onSortChange?.(sort);
  };

  const sortLabels = {
    nearby: "주변매물",
    "price-low": "월세 낮은순",
    "price-high": "월세 높은순",
  };

  const highlight = (text: string, keyword: string) => {
    if (!keyword) return <>{text}</>;
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return (
      <>
        {text.split(regex).map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-yellow-100 text-yellow-900 rounded px-0.5 not-italic"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="p-4 border-b border-gray-200 space-y-3" ref={containerRef}>
      {/* 주소 검색 입력 */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder="도로명, 지번, 건물명으로 검색"
            className="w-full pl-9 pr-9 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 w-4 h-4 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* 자동완성 드롭다운 */}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
            {suggestions.map((addr, i) => (
              <li key={i}>
                <button
                  onClick={() => handleSelect(addr)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    {addr.roadAddress && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                          도로명
                        </span>
                        <span className="text-sm text-gray-800 truncate">
                          {highlight(addr.roadAddress, query)}
                        </span>
                      </div>
                    )}
                    {addr.jibunAddress && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
                          지번
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {highlight(addr.jibunAddress, query)}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 결과 없음 */}
        {isOpen &&
          !isLoading &&
          suggestions.length === 0 &&
          debouncedQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 px-4 py-6 text-center text-sm text-gray-400">
              '{debouncedQuery}' 검색 결과가 없습니다
            </div>
          )}
      </div>

      {/* 정렬 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-700">{sortLabels[selectedSort]}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${sortOpen ? "rotate-180" : ""}`}
          />
        </button>

        {sortOpen && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {(["nearby", "price-low", "price-high"] as const).map((sort, i) => (
              <li key={sort}>
                <button
                  onClick={() => handleSortChange(sort)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${i > 0 ? "border-t border-gray-200" : ""} ${selectedSort === sort ? "bg-gray-100 font-semibold" : ""}`}
                >
                  {sortLabels[sort]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
