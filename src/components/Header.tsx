import { useState } from 'react';
import type { TransactionType } from '@shared/types';
import { TRANSACTION_TYPES } from '@shared/const';


const TRANSACTION_TYPES_CONST = TRANSACTION_TYPES;

interface HeaderProps {
  transactionType: TransactionType;
  onTransactionTypeChange: (type: TransactionType) => void;
}

export function Header({
  transactionType,
  onTransactionTypeChange,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs: Array<{ key: TransactionType; label: string }> = [
    { key: TRANSACTION_TYPES.SALE, label: '매매' },
    { key: TRANSACTION_TYPES.RENT, label: '월세' },
    { key: TRANSACTION_TYPES.LEASE, label: '전세' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 좌측: 로고 + 탭 */}
        <div className="flex items-center gap-12">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-black">ZIPZA</h1>
          </div>

          {/* 탭 */}
          <nav className="hidden md:flex items-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTransactionTypeChange(tab.key)}
                className={`text-base font-medium transition-colors pb-2 ${
                  transactionType === tab.key
                    ? 'text-black font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 우측: 마이페이지 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
          >
            마이페이지
          </button>

          {/* 사용자 메뉴 드롭다운 */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b">
                프로필
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b">
                찜한 매물
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b">
                최근 본 매물
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 탭 */}
      <div className="md:hidden flex border-t border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTransactionTypeChange(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              transactionType === tab.key
                ? 'text-black border-black'
                : 'text-gray-600 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
