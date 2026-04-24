import { Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "검색 결과가 없습니다",
  description = "필터 조건을 변경해보세요.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-gray-400">
        {icon || <Search className="w-12 h-12 mx-auto" />}
      </div>
      <p className="text-gray-700 font-semibold mb-1">{title}</p>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
