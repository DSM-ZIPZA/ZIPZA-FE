import type { PropertyDetail } from "@/shared/types";
import { CandlestickChart } from "./CandlestickChart";
import { RegistrationTable } from "./RegistrationTable";
import { BuildingLandSection } from "./BuildingLandSection";
import { OverallAnalysisSection } from "./OverallAnalysisSection";

interface Props {
  property: PropertyDetail;
}

export function PropertyDetailPanel({ property }: Props) {
  return (
    <div className="p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex justify-between items-start gap-4">
        <h2 className="text-xl font-bold text-gray-900">{property.name}</h2>
        <span className="text-sm text-gray-400 whitespace-nowrap">
          {property.price.toLocaleString()}원
        </span>
      </div>

      <section className="flex gap-3 flex-col">
        <h3 className="text-md font-bold text-gray-900">건물정보</h3>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          <span className="text-gray-500 font-semibold">소재지번</span>
          <span className="text-gray-400">{property.address}</span>
          <span className="text-gray-500 font-semibold">건물번호</span>
          <span className="text-gray-400">{property.buildingNumber}</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm mt-1">
          <span className="text-gray-500 font-semibold">면적</span>
          <span className="text-gray-400">{property.area}㎡</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm mt-1">
          <span className="text-gray-500 font-semibold">매매가 평균</span>
          <span className="text-gray-400">
            {Math.floor(property.avgSalePrice / 100000000)}억{" "}
            {Math.floor((property.avgSalePrice % 100000000) / 10000)}천만
          </span>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">
          시세추이
        </h3>
        <CandlestickChart data={property.priceHistory} />
      </section>

      <RegistrationTable sections={property.registrationAnalysis} />
      <BuildingLandSection info={property.buildingLandAnalysis} />
      <OverallAnalysisSection analysis={property.overallAnalysis} />
    </div>
  );
}
