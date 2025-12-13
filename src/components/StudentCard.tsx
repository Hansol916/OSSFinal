import { StudentCardData } from "@/types/studentCard";

interface Props {
  student: StudentCardData;
  editable: boolean;
  onScoreChange: (studentId: number, categoryId: number, score: number) => void;
}

export default function StudentCard({
  student,
  editable,
  onScoreChange,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      {/* 학생 기본 정보 */}
      <div className="mb-3">
        <div className="text-lg font-semibold text-gray-900">
          {student.name} ({student.student_number})
        </div>
      </div>

      {/* 항목별 점수 */}
      <div className="space-y-2 text-sm">
        {student.scores.map((s) => (
          <div
            key={s.category_id}
            className="flex items-center justify-between"
          >
            <span className="text-gray-900">{s.category_name}</span>

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
                className={`w-16 rounded border px-2 py-1 text-right
                  ${
                    !editable
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
              />
              <span className="text-gray-400">/ {s.max_score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 총점 + 등급 */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="text-sm text-gray-600">
          총점 <b>{student.total}</b>
        </div>
        <div className="text-xl font-bold text-blue-600">{student.grade}</div>
      </div>
    </div>
  );
}
