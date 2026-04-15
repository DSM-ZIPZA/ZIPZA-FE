import type { BuildingLandInfo } from "@/shared/types";

interface Props {
  info: BuildingLandInfo;
}

export function BuildingLandSection({ info }: Props) {
  return (
    <section>
      <h3 className="text-md font-bold text-gray-900 pb-2 mb-3">
        건물 및 토지 분석
      </h3>
      <h4 className="text-xs font-semibold mb-2">임대인정보</h4>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {["용도", "동/호수", "위반건축물"].map(h => (
                <th
                  key={h}
                  className="px-3 py-2 text-center font-semibold border-b border-gray-200 bg-gray-50"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-3 text-center">{info.rentalInfo.usage}</td>
              <td className="px-3 py-3 text-center">
                {info.rentalInfo.dongHo}
              </td>
              <td className="px-3 py-3 text-center">
                {info.rentalInfo.illegalBuilding}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
