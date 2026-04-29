import { useAuth } from "@/shared/contexts/AuthContext";

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 1.667C5.4 1.667 1.667 4.633 1.667 8.333c0 2.311 1.378 4.344 3.467 5.578l-.878 3.289 3.822-2.522c.622.089 1.256.133 1.922.133 4.6 0 8.333-2.966 8.333-6.666S14.6 1.667 10 1.667z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

export function LoginModal() {
  const { mockLogin } = useAuth();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[340px] overflow-hidden">
        {/* 헤더 영역 */}
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="text-3xl font-bold text-black tracking-tight">ZIPZA</h1>
          <p className="text-gray-400 text-sm mt-2">집을 더 스마트하게 찾는 방법</p>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gray-100 mx-8" />

        {/* 로그인 영역 */}
        <div className="px-8 py-6 flex flex-col gap-3">
          <p className="text-xs text-gray-400 text-center mb-1">
            로그인하고 맞춤 매물을 확인하세요
          </p>
          <button
            onClick={mockLogin}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#FEE500", color: "#000000" }}
          >
            <KakaoIcon />
            카카오로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
