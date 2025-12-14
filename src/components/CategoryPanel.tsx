import { Category } from "@/types/category";

interface Props {
  categories: Category[];
  weightError?: string | null;
  totalWeight: number;
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  categoryAverages: Record<number, number | null>;
}

export default function CategoryPanel({
  categories,
  weightError,
  totalWeight,
  onAdd,
  onEdit,
  onDelete,
  categoryAverages,
}: Props) {
  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
          성적 항목
        </h2>
        <button
          onClick={onAdd}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + 항목 추가
        </button>
      </div>

      {/* 항목 리스트 */}
      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <div className="flex items-start justify-between gap-3">
              {/* 왼쪽 정보 */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {c.name}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                  <span>만점{c.max_score}</span>
                  <span>·</span>
                  <span>비중{c.weight}%</span>
                </div>

                <div className="mt-1 text-xs text-gray-700">
                  평균 점수{" "}
                  <span className="font-semibold text-gray-900">
                    {categoryAverages[c.id] === null
                      ? "-"
                      : categoryAverages[c.id]}
                  </span>
                </div>
              </div>

              {/* 수정 / 삭제 */}
              <div className="flex shrink-0 gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => onEdit(c)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 빈 상태 */}
        {categories.length === 0 && (
          <p className="text-sm text-gray-400">아직 성적 항목이 없습니다.</p>
        )}

        {/* 가중치 경고 */}
        {weightError && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            ⚠️ {weightError}
            <div className="mt-1 text-xs text-yellow-700">
              현재 가중치 합: <b>{totalWeight}%</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
