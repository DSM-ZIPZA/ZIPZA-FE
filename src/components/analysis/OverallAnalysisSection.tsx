import type { OverallAnalysis } from "@/shared/types";

interface Props {
  analysis: OverallAnalysis;
}

export function OverallAnalysisSection({ analysis }: Props) {
  const { rentalInfo } = analysis;
  const scores = [
    { label: "종합 위험도", value: rentalInfo.totalRiskScore },
    { label: "가격 점수", value: rentalInfo.priceScore },
    { label: "등기부동본 점수", value: rentalInfo.registrationScore },
    { label: "건물 및 토지 점수", value: rentalInfo.buildingLandScore },
  ];

  return (
    <section>
      <h3 className="text-md font-bold text-gray-900 pb-2 mb-3">전체분석</h3>
      <h4 className="text-xs font-semibold mb-2">임대인정보</h4>
      <div className="overflow-x-auto rounded-md border border-gray-200 mb-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {scores.map(s => (
                <th
                  key={s.label}
                  className="px-3 py-2 text-center font-semibold border-b border-gray-200 whitespace-nowrap bg-gray-50"
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {scores.map(s => (
                <td key={s.label} className="px-3 py-3 text-center">
                  {s.value}점
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-1.5">
        {rentalInfo.warningMessages.map((msg, i) => (
          <p
            key={i}
            className="text-sm text-red-500 bg-red-50 pl-3 py-3 rounded-xl"
          >
            {msg}
          </p>
        ))}
      </div>
    </section>
  );
}
