import { useState, useEffect, useRef } from "react";
import type { Property, PropertyDetail } from "@/shared/types";
import { mockPropertyDetail } from "@/shared/lib/mock-data";
import { PropertyDetailPanel } from "./PropertyDetailPanel";
import { IconZoom, IconZoomQuestion } from "@tabler/icons-react";

function formatSidebarPrice(value: number) {
  const eok = Math.floor(value / 100000000);
  const man = Math.floor((value % 100000000) / 10000);
  if (eok > 0 && man > 0) return `${eok}억 ${man}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${man}만원`;
}

interface PropertyAnalysisDrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth?: number;
}

export function PropertyAnalysisDrawer({
  property,
  isOpen,
  onClose,
  sidebarWidth = 384,
}: PropertyAnalysisDrawerProps) {
  const [maintenanceFee, setMaintenanceFee] = useState("");
  const [analysisResult, setAnalysisResult] = useState<PropertyDetail | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setMaintenanceFee("");
  }, [property?.id]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAnalyze = () => {
    if (!property) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        ...mockPropertyDetail,
        id: property.id,
        name: property.title,
        price: property.price,
        address: property.address,
        area: property.area,
      });
      setIsAnalyzing(false);
    }, 800);
  };

  if (!property) return null;

  return (
    <>
      <div
        className={`fixed top-0 bottom-0 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ left: sidebarWidth, right: 0 }}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className={`fixed bottom-0 z-50 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out`}
        style={{
          left: sidebarWidth,
          right: 0,
          height: "75vh",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              {property.title}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 text-sm transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden px-1 min-h-0">
          <div className="shrink-0 w-72 flex flex-col overflow-y-auto">
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div>
                <span className="block text-sm font-semibold mb-1.5">
                  동호수
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-sm mb-1">동</span>
                    <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800">
                      {mockPropertyDetail.dong}동
                    </div>
                  </div>
                  <div>
                    <span className="block text-sm mb-1">호</span>
                    <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800">
                      {mockPropertyDetail.ho}호
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  보증금
                </span>
                <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 flex justify-between items-center">
                  <span>{formatSidebarPrice(mockPropertyDetail.deposit)}</span>
                  <span className="text-[11px] text-gray-400">3억</span>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  월세
                </span>
                <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 flex justify-between items-center">
                  <span>
                    {formatSidebarPrice(mockPropertyDetail.monthlyRent)}
                  </span>
                  <span className="text-[11px] text-gray-400">30만</span>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  관리비
                </span>
                <input
                  type="number"
                  value={maintenanceFee}
                  onChange={e => setMaintenanceFee(e.target.value)}
                  placeholder="가격을 입력해주세요"
                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-w-0">
            {!analysisResult ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="text-5xl mb-2">
                  <IconZoomQuestion size={96} />
                </div>
                <p className="text-base font-medium text-gray-700">
                  아직 <span className="font-semibold">{property.title}</span>에
                  대한 분석 결과가 없습니다.
                </p>
                <p className="text-xs text-gray-400">
                  왜 이 정보들이 필요한가요?
                </p>
              </div>
            ) : (
              <PropertyDetailPanel property={analysisResult} />
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-white">
          <p className="text-[10px] text-gray-300">
            ZIPZA 서비스는 월, 전세사기에 대해 책임을 일체 지지 않습니다.
          </p>
          <div className="flex items-center gap-2">
            {!analysisResult ? (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    분석 중...
                  </>
                ) : (
                  "분석 시작하기 →"
                )}
              </button>
            ) : (
              <>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  알림 등록하기
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
                  마이페이지로 보내기 →
                </button>
              </>
            )}
          </div>
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-t-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 font-medium">
                매물 분석 중...
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
