import { useState, useMemo, useRef, useEffect } from "react";
import StudentCard from "@/components/StudentCard";
import { StudentCardData } from "@/types/studentCard";
import StudentExcelButton from "@/components/StudentExcelButton";

type SortOption = "student_asc" | "student_desc" | "total_asc" | "total_desc";

interface Props {
  students: StudentCardData[];
  onScoreChange: (studentId: number, categoryId: number, score: number) => void;
  onDeleteStudent: (studentId: number) => void;
  onAddStudent: () => void;
  onAddStudentsFromExcel: (
    students: { name: string; student_number: string }[]
  ) => void;
}

export default function StudentGrid({
  students,
  onScoreChange,
  onDeleteStudent,
  onAddStudent,
  onAddStudentsFromExcel,
}: Props) {
  const [editable, setEditable] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("student_asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  /* 정렬 */
  const sortedStudents = useMemo(() => {
    const copy = [...students];
    switch (sortOption) {
      case "student_asc":
        return copy.sort((a, b) =>
          a.student_number.localeCompare(b.student_number)
        );
      case "student_desc":
        return copy.sort((a, b) =>
          b.student_number.localeCompare(a.student_number)
        );
      case "total_asc":
        return copy.sort((a, b) => a.total - b.total);
      case "total_desc":
        return copy.sort((a, b) => b.total - a.total);
      default:
        return copy;
    }
  }, [students, sortOption]);

  /* 드롭다운 닫기 (바깥 클릭 + ESC) */
  useEffect(() => {
    if (!isSortOpen) return;

    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setIsSortOpen(false);
      }

      if (
        e instanceof MouseEvent &&
        sortRef.current &&
        !sortRef.current.contains(e.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isSortOpen]);

  return (
    <div className="flex h-full flex-col">
      {/* 상단 컨트롤 (고정) */}
      <div className="mb-4 flex items-center justify-between px-6 pt-6">
        <h2 className="text-xl font-bold text-gray-900">학생 목록</h2>

        <div className="flex items-center gap-2">
          {/* 정렬 */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setIsSortOpen((v) => !v)}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              정렬
            </button>

            {isSortOpen && (
              <div className="absolute right-0 z-20 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg">
                <SortBtn
                  label="학번 ↑"
                  active={sortOption === "student_asc"}
                  onClick={() => {
                    setSortOption("student_asc");
                    setIsSortOpen(false);
                  }}
                />
                <SortBtn
                  label="학번 ↓"
                  active={sortOption === "student_desc"}
                  onClick={() => {
                    setSortOption("student_desc");
                    setIsSortOpen(false);
                  }}
                />
                <SortBtn
                  label="성적 ↑"
                  active={sortOption === "total_asc"}
                  onClick={() => {
                    setSortOption("total_asc");
                    setIsSortOpen(false);
                  }}
                />
                <SortBtn
                  label="성적 ↓"
                  active={sortOption === "total_desc"}
                  onClick={() => {
                    setSortOption("total_desc");
                    setIsSortOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {!editable ? (
            <button
              onClick={() => setEditable(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              점수 수정
            </button>
          ) : (
            <button
              onClick={() => setEditable(false)}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm text-white"
            >
              수정 완료
            </button>
          )}

          <button
            onClick={onAddStudent}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            + 학생 추가
          </button>

          <StudentExcelButton onParsed={onAddStudentsFromExcel} />
        </div>
      </div>

      {/* ⭐ 카드 영역만 스크롤 */}
      <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: "100%" }}>
        <div className="grid grid-cols-4 gap-4 pr-1">
          {sortedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              editable={editable}
              onScoreChange={onScoreChange}
              onDelete={() => onDeleteStudent(student.id)}
            />
          ))}

          {sortedStudents.length === 0 && (
            <p className="col-span-full text-sm text-gray-400">
              아직 등록된 학생이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* 정렬 버튼 */
function SortBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 text-left text-sm transition
        ${
          active
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}
