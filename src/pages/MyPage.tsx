import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { zipzaApi } from "@/shared/api/zipza";
import type { AnalysisRequestResponse } from "@/shared/api/types";

export default function MyPage() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<AnalysisRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    zipzaApi
      .getAnalysisRequests()
      .then(setItems)
      .catch(() => setErrorMessage("분석 요청 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-600 hover:text-black"
        >
          돌아가기
        </button>
      </header>

      <section className="max-w-3xl mx-auto p-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : errorMessage ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">저장된 분석 요청이 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {items.map(item => (
              <article key={item.requestId} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {item.property?.title ??
                        item.property?.roadAddress ??
                        item.requestId}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {item.contractType} · 보증금 {item.depositAmount ?? 0}만원
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{item.status}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
