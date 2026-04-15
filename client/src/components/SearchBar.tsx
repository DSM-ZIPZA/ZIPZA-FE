import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SearchBarProps {
  onLocationChange?: (location: string) => void;
  onSortChange?: (sort: 'nearby' | 'price-low' | 'price-high') => void;
}

export function SearchBar({ onLocationChange, onSortChange }: SearchBarProps) {
  const [location, setLocation] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'nearby' | 'price-low' | 'price-high'>('nearby');

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    onLocationChange?.(e.target.value);
  };

  const handleSortChange = (sort: 'nearby' | 'price-low' | 'price-high') => {
    setSelectedSort(sort);
    setSortOpen(false);
    onSortChange?.(sort);
  };

  const sortLabels = {
    nearby: '주변매물',
    'price-low': '월세 낮은순',
    'price-high': '월세 높은순',
  };

  return (
    <div className="p-4 border-b border-gray-200 space-y-3">
      {/* 검색 입력 */}
      <input
        type="text"
        value={location}
        onChange={handleLocationChange}
        placeholder="현재 위치를 입력하세요."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
      />

      {/* 정렬 옵션 */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-700">{sortLabels[selectedSort]}</span>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* 드롭다운 메뉴 */}
        {sortOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleSortChange('nearby')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                selectedSort === 'nearby' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              주변매물
            </button>
            <button
              onClick={() => handleSortChange('price-low')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors border-t border-gray-200 ${
                selectedSort === 'price-low' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              월세 낮은순
            </button>
            <button
              onClick={() => handleSortChange('price-high')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors border-t border-gray-200 ${
                selectedSort === 'price-high' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              월세 높은순
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
