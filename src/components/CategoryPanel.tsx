import { Category } from "@/types/category";

interface Props {
  categories: Category[];
  weightError?: string | null;
  totalWeight: number;
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

export default function CategoryPanel({
  categories,
  weightError,
  totalWeight,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="h-full rounded-xl border bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">성적 항목</h2>
        <button
          onClick={onAdd}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + 항목 추가
        </button>
      </div>

      {/* 항목 리스트 */}
      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="group rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{c.name}</div>
                <div className="mt-1 text-xs text-gray-600">
                  만점 {c.max_score} · 비중 {c.weight}%
                </div>
              </div>

              {/* 수정 / 삭제 */}
              <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => onEdit(c)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-sm text-gray-400">아직 성적 항목이 없습니다.</p>
        )}
        {weightError && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            ⚠️ {weightError}
            <div className="mt-1 text-xs text-yellow-600">
              현재 가중치 합: {totalWeight}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
