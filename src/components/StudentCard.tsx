import { StudentCardData } from "@/types/studentCard";

interface Props {
  student: StudentCardData;
  editable: boolean;
  onScoreChange: (studentId: number, categoryId: number, score: number) => void;
  onDelete?: () => void;
}

export default function StudentCard({
  student,
  editable,
  onScoreChange,
  onDelete,
}: Props) {
  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-blue-300 transition">
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="absolute right-2 top-2 text-[11px] text-red-500 hover:underline"
      >
        삭제
      </button>

      {/* 학생 정보 */}
      <div className="mb-2">
        <div className="text-sm font-semibold text-gray-900 leading-tight">
          {student.name}
        </div>
        <div className="text-xs text-gray-500">{student.student_number}</div>
      </div>

      {/* 점수 입력 (압축) */}
      <div className="space-y-1.5">
        {student.scores.map((s) => (
          <div
            key={s.category_id}
            className="flex items-center justify-between text-xs"
          >
            <span className="truncate text-gray-700">{s.category_name}</span>

            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={s.max_score}
                value={s.score ?? ""}
                disabled={!editable}
                onChange={(e) => {
                  if (!editable) return;
                  const v = e.target.value;
                  onScoreChange(
                    student.id,
                    s.category_id,
                    v === "" ? 0 : Number(v)
                  );
                }}
                className={`w-12 rounded border px-1 py-0.5 text-right text-xs
                  ${
                    editable
                      ? "border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              />
              <span className="text-gray-400">/{s.max_score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 총점 / 등급 */}
      <div className="mt-2 flex items-center justify-between border-t pt-1.5">
        <span className="text-xs text-gray-600">
          총점 <b className="text-gray-900">{student.total}</b>
        </span>
        <span className="text-sm font-bold text-blue-600">{student.grade}</span>
      </div>
    </div>
  );
}
