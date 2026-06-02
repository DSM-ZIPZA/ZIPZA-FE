import { useState, useEffect, useRef } from "react";
import type { Property, PropertyDetail } from "@/shared/types";
import { PropertyDetailPanel } from "./PropertyDetailPanel";
import { IconZoomQuestion } from "@tabler/icons-react";
import { TOKEN_KEY } from "@/shared/api/client";
import {
  detailToPropertyDetail,
  transactionToContractType,
  zipzaApi,
} from "@/shared/api/zipza";

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
  const [dong, setDong] = useState("");
  const [ho, setHo] = useState("");
  const [floor, setFloor] = useState("");
  const [exclusiveArea, setExclusiveArea] = useState("");
  const [deposit, setDeposit] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [balanceDate, setBalanceDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [analysisResult, setAnalysisResult] = useState<PropertyDetail | null>(
    null
  );
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
    setRequestId(null);
    setIsAnalyzing(false);
    setMaintenanceFee("");
    setErrorMessage("");
    setDong("");
    setHo("");
    setFloor(property?.floor ? String(property.floor) : "");
    setExclusiveArea(
      property?.exclusiveAreaM2 ? String(property.exclusiveAreaM2) : ""
    );
    setDeposit(property?.deposit ? String(Math.round(property.deposit / 10000)) : "");
    setMonthlyRent(
      property?.monthlyRent ? String(Math.round(property.monthlyRent / 10000)) : ""
    );
    const today = new Date();
    const balance = new Date(today);
    balance.setDate(today.getDate() + 30);
    const expiry = new Date(today);
    expiry.setFullYear(today.getFullYear() + 2);
    setContractDate(today.toISOString().slice(0, 10));
    setBalanceDate(balance.toISOString().slice(0, 10));
    setExpiryDate(expiry.toISOString().slice(0, 10));
  }, [property?.id]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAnalyze = async () => {
    if (!property) return;
    if (!localStorage.getItem(TOKEN_KEY)) {
      setErrorMessage("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage("");
    try {
      const created = await zipzaApi.createAnalysisRequest({
        property: {
          roadAddress: property.roadAddress ?? property.address,
          jibunAddress: property.jibunAddress ?? property.address,
          detailAddress: property.detailAddress ?? `${dong}동 ${ho}호`,
          buildingManagementNumber: property.buildingManagementNumber ?? "",
          postalCode: property.postalCode ?? "",
          administrativeCode: property.administrativeCode ?? "",
          city: property.city ?? "",
          district: property.district ?? "",
          neighborhood: property.neighborhood ?? "",
          buildingName: property.title,
          isApartment: property.isApartment ?? property.type === "apartment",
          longitude: property.longitude,
          latitude: property.latitude,
        },
        contractType: transactionToContractType(property.transactionType),
        depositAmount: Number(deposit || 0),
        monthlyRent: monthlyRent ? Number(monthlyRent) : null,
        floor: Number(floor || property.floor || 1),
        exclusiveArea: Number(
          exclusiveArea || property.exclusiveAreaM2 || property.area * 3.3058 || 0
        ),
        contractDate,
        balanceDate,
        expiryDate,
      });
      setRequestId(created.requestId);
      await zipzaApi.startAnalysis(created.requestId, {
        building: { dong: dong || "1", ho: ho || "1" },
        registry: { address: property.roadAddress ?? property.address },
        rentTradeMonths: 24,
      });
      const detail = await zipzaApi.getAnalysisDetail(created.requestId);
      setAnalysisResult(detailToPropertyDetail(detail));
    } catch (error) {
      const status = error instanceof Error && "status" in error
        ? Number((error as { status: number }).status)
        : null;
      if (status === 401) {
        setErrorMessage("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      } else if (status === 403) {
        setErrorMessage("서버에서 요청 권한을 거부했습니다. 로그인 토큰은 유지했으니 잠시 후 다시 시도해주세요.");
      } else {
        setErrorMessage("분석을 실행하지 못했습니다. 입력값과 서버 상태를 확인해주세요.");
      }
    } finally {
      setIsAnalyzing(false);
    }
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
                      <input
                        value={dong}
                        onChange={e => setDong(e.target.value)}
                        placeholder="동"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-sm mb-1">호</span>
                    <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800">
                      <input
                        value={ho}
                        onChange={e => setHo(e.target.value)}
                        placeholder="호"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  보증금
                </span>
                <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 flex justify-between items-center">
                  <input
                    type="number"
                    value={deposit}
                    onChange={e => setDeposit(e.target.value)}
                    placeholder="만원 단위"
                    className="w-full outline-none"
                  />
                  <span className="text-[11px] text-gray-400">만원</span>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  층 / 전용면적
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 flex items-center gap-1">
                    <input
                      type="number"
                      value={floor}
                      onChange={e => setFloor(e.target.value)}
                      placeholder="층"
                      className="w-full outline-none"
                    />
                    <span className="text-[11px] text-gray-400">층</span>
                  </div>
                  <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 flex items-center gap-1">
                    <input
                      type="number"
                      value={exclusiveArea}
                      onChange={e => setExclusiveArea(e.target.value)}
                      placeholder="㎡"
                      className="w-full outline-none"
                    />
                    <span className="text-[11px] text-gray-400">㎡</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  월세
                </span>
                <div className="border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 flex justify-between items-center">
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={e => setMonthlyRent(e.target.value)}
                    placeholder="만원 단위"
                    className="w-full outline-none"
                  />
                  <span className="text-[11px] text-gray-400">만원</span>
                </div>
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  계약일
                </span>
                <input
                  type="date"
                  value={contractDate}
                  onChange={e => setContractDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 outline-none"
                />
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  잔금일
                </span>
                <input
                  type="date"
                  value={balanceDate}
                  onChange={e => setBalanceDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 outline-none"
                />
              </div>

              <div>
                <span className="block text-xs text-gray-400 font-medium mb-1.5">
                  만료일
                </span>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm text-gray-800 outline-none"
                />
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
                  동/호수와 계약 조건을 입력한 뒤 분석을 시작해주세요.
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-500">{errorMessage}</p>
                )}
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
                <button
                  onClick={() => {
                    if (!requestId) return;
                    const remindDate = balanceDate || contractDate;
                    zipzaApi.createReminder(requestId, {
                      reminderType: "BEFORE_BALANCE",
                      remindDate,
                      channel: "EMAIL",
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  알림 등록하기
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/mypage";
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                >
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
