import type { RegistrationSection } from "@/shared/types";

interface Props {
  sections: RegistrationSection[];
}

export function RegistrationTable({ sections }: Props) {
  return (
    <section>
      <h3 className="text-md font-bold text-gray-900 pb-2 mb-3">
        부동산등기부 분석
      </h3>
      <div className="flex flex-col gap-4">
        {sections.map(section => (
          <div key={section.title}>
            <h4 className="text-xs font-semibold  mb-2">{section.title}</h4>
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {[
                      "순위번호",
                      "등기목적",
                      "접수",
                      "등기원인",
                      "권리자 및 기타사항",
                    ].map(h => (
                      <th
                        key={h}
                        className="px-2.5 py-2 text-center font-semibold border-b border-gray-200 whitespace-nowrap bg-gray-50"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.records.map((record, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2.5 py-3 text-center">{record.rank}</td>
                      <td className="px-2.5 py-3 text-center whitespace-nowrap">
                        {record.purpose}
                      </td>
                      <td className="px-2.5 py-3 text-center whitespace-nowrap">
                        {record.registrationDate}
                      </td>
                      <td className="px-2.5 py-3 text-center whitespace-nowrap">
                        {record.registrationCause}
                      </td>
                      <td
                        className="px-2.5 py-3 text-center leading-relaxed"
                        style={{ maxWidth: 220, wordBreak: "keep-all" }}
                      >
                        {record.rightsAndNotes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
