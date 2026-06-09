import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { detailToPropertyDetail, zipzaApi } from "@/shared/api/zipza";
import type { AnalysisRequestResponse } from "@/shared/api/types";
import type { PropertyDetail } from "@/shared/types";
import { PropertyDetailPanel } from "@/components/analysis/PropertyDetailPanel";
import { ArrowLeft, ChevronRight, LoaderCircle } from "lucide-react";

function contractLabel(contractType?: "JEONSE" | "MONTHLY_RENT") {
  return contractType === "MONTHLY_RENT" ? "월세" : "전세";
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    PENDING: "분석 대기",
    IN_PROGRESS: "분석 중",
    COMPLETED: "분석 완료",
    FAILED: "분석 실패",
  };
  return status ? (labels[status] ?? status) : "";
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default function MyPage() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<AnalysisRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<PropertyDetail | null>(
    null
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    zipzaApi
      .getAnalysisRequests()
      .then(setItems)
      .catch(() => setErrorMessage("분석 요청 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const openAnalysis = async (requestId: string) => {
    setSelectedRequestId(requestId);
    setSelectedDetail(null);
    setIsDetailLoading(true);
    setErrorMessage("");
    try {
      const detail = await zipzaApi.getAnalysisDetail(requestId);
      setSelectedDetail(detailToPropertyDetail(detail));
    } catch {
      setErrorMessage("저장된 분석 결과를 불러오지 못했습니다.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedRequestId(null);
    setSelectedDetail(null);
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
        {selectedRequestId ? (
          <button
            onClick={closeDetail}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            분석 목록
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-600 hover:text-black"
          >
            돌아가기
          </button>
        )}
      </header>

      <section className="max-w-4xl mx-auto p-6">
        {selectedRequestId && isDetailLoading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            분석 결과를 불러오는 중...
          </div>
        ) : selectedDetail ? (
          <PropertyDetailPanel property={selectedDetail} />
        ) : isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : errorMessage ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">저장된 분석 요청이 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {items.map(item => (
              <button
                key={item.requestId}
                type="button"
                onClick={() => openAnalysis(item.requestId)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      {item.property?.roadAddress ?? item.requestId}
                    </h2>
                    <span className="text-xs text-gray-400">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {contractLabel(item.contractType)} · 보증금{" "}
                    {(item.depositAmount ?? 0).toLocaleString()}만원
                    {item.contractType === "MONTHLY_RENT" &&
                    item.monthlyRent != null
                      ? ` · 월세 ${item.monthlyRent.toLocaleString()}만원`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(item.requestedAt)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
