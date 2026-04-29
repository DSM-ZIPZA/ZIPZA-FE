import { useState, useRef, useEffect } from "react";
import type { TransactionType } from "@/shared/types";
import { TRANSACTION_TYPES } from "@/shared/const";
import { useAuth } from "@/shared/contexts/AuthContext";
import { ChevronDown, LogOut } from "lucide-react";

interface HeaderProps {
  transactionType: TransactionType;
  onTransactionTypeChange: (type: TransactionType) => void;
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#FEE500] flex items-center justify-center text-black font-bold text-xs select-none">
      {name.charAt(0)}
    </div>
  );
}

export function Header({ transactionType, onTransactionTypeChange }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const tabs: Array<{ key: TransactionType; label: string }> = [
    { key: TRANSACTION_TYPES.SALE, label: "매매" },
    { key: TRANSACTION_TYPES.RENT, label: "월세" },
    { key: TRANSACTION_TYPES.LEASE, label: "전세" },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 좌측: 로고 + 탭 */}
        <div className="flex items-center gap-12">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-black">ZIPZA</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => onTransactionTypeChange(tab.key)}
                className={`text-base font-medium transition-colors pb-2 ${
                  transactionType === tab.key
                    ? "text-black font-bold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 우측: 유저 메뉴 */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-black transition-colors"
            >
              <UserAvatar name={user.name} />
              <span>{user.name}님</span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {/* 이메일 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">이메일</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
                {/* 로그아웃 */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={14} className="text-gray-400" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 모바일 탭 */}
      <div className="md:hidden flex border-t border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTransactionTypeChange(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              transactionType === tab.key
                ? "text-black border-black"
                : "text-gray-600 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
