import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import StudentGrid from "@/components/StudentGrid";
import CategoryPanel from "@/components/CategoryPanel";
import StudentAddModal from "@/components/StudentAddModal";
import AddCategoryModal from "@/components/AddCategoryModal";
import { StudentCardData } from "@/types/studentCard";
import { Category } from "@/types/category";
import { RELATIVE_GRADES } from "@/constants/grades";
import { RelativeGradeConfig } from "@/types/relativeGrade";
import RelativeGradeCutModal from "@/components/RelativeGradeCutModal";
import { Subject } from "@/types/subject";

//   DB Student → UI StudentCardData 변환
function toStudentCardData(
  student: {
    id: number;
    name: string;
    student_number: string;
    class_number: string;
    created_at: string;
  },
  categories: Category[]
): StudentCardData {
  return {
    id: student.id,
    name: student.name,
    student_number: student.student_number,
    class_number: student.class_number,
    created_at: student.created_at,
    scores: categories.map((c) => ({
      category_id: c.id,
      category_name: c.name,
      score: null,
      max_score: c.max_score,
    })),
    total: 0,
    grade: "-",
  };
}

export default function SubjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  //임시 정보
  const [subject, setSubject] = useState<Subject | null>(null);
  useEffect(() => {
    if (!id) return;
    console.log("📌 subject fetch id:", id);
    fetch(`/api/subjects/get?id=${id}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("📌 subject get 응답:", json);
        if (!json.data) return;

        setSubject(json.data);
        setGradingType(json.data.grading_type); // ⭐ 동기화
      });
  }, [id]);

  //State
  const [students, setStudents] = useState<StudentCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const totalWeight = getTotalWeight(categories);

  const [gradingType, setGradingType] = useState<
    "absolute" | "relative" | null
  >(null);
  const [isRelativeModalOpen, setIsRelativeModalOpen] = useState(false);

  const [relativeConfig, setRelativeConfig] = useState<RelativeGradeConfig>(
    () =>
      RELATIVE_GRADES.map((grade, idx, arr) => ({
        grade,
        maxPercent: idx === arr.length - 1 ? 100 : 0,
      }))
  );

  //Fetch Categories
  async function fetchCategories() {
    if (!id) return;
    const res = await fetch(`/api/${id}/categories/list`);
    const json = await res.json();
    if (res.ok) setCategories(json.data);
  }

  //Fetch Students
  async function fetchStudents(categoriesSnapshot: Category[]) {
    if (!id) return;

    const res = await fetch(`/api/${id}/students/list`);
    const json = await res.json();

    if (!res.ok) return;

    const cards = json.students.map((s: any) =>
      toStudentCardData(s, categoriesSnapshot)
    );

    setStudents(cards);
  }

  //category Handlers
  async function handleSubmitCategory(data: {
    name: string;
    max_score: number;
    weight: number;
  }) {
    if (!id) return;

    if (editingCategory) {
      const res = await fetch(
        `/api/${id}/categories/${editingCategory.id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) return alert("성적 항목 수정 실패");
    } else {
      const res = await fetch(`/api/${id}/categories/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return alert("성적 항목 추가 실패");
    }

    setIsAddCategoryOpen(false);
    setEditingCategory(null);
    fetchCategories();
  }

  async function handleDeleteCategory(categoryId: number) {
    if (!confirm("이 항목을 삭제하면 모든 학생 점수가 함께 삭제됩니다."))
      return;

    const res = await fetch(`/api/${id}/categories/${categoryId}/delete`, {
      method: "DELETE",
    });

    if (!res.ok) return alert("삭제 실패");
    fetchCategories();
  }
  //Fetch Scores By Subject
  async function fetchScoresBySubject() {
    if (!id) return;

    const res = await fetch(`/api/${id}/scores/getBySubject`);
    if (!res.ok) return [];

    const json = await res.json();
    return json.data ?? [];
  }
  function getTotalWeight(
    categories: Category[],
    editing?: Category | null,
    nextWeight?: number
  ) {
    return categories.reduce((sum, c) => {
      if (editing && c.id === editing.id) {
        return sum + (nextWeight ?? 0);
      }
      return sum + c.weight;
    }, 0);
  }
  async function handleChangeGradingType(type: "absolute" | "relative") {
    console.log("gradingType 변경 시도:", type);

    const res = await fetch("/api/subjects/updateSetting", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(id), // ⭐ 반드시 Number
        grading_type: type, // ⭐ absolute | relative
      }),
    });

    const json = await res.json();
    console.log("updateSetting 응답:", json);

    if (!res.ok) {
      alert("grading_type 업데이트 실패");
      return;
    }

    setGradingType(type);
  }

  //Initial Data Fetch
  useEffect(() => {
    if (!id) return;

    (async () => {
      // 1️⃣ categories
      const catRes = await fetch(`/api/${id}/categories/list`);
      const catJson = await catRes.json();
      if (!catRes.ok) return;

      const categories = catJson.data;
      setCategories(categories);

      // 2️⃣ students
      const stuRes = await fetch(`/api/${id}/students/list`);
      const stuJson = await stuRes.json();
      if (!stuRes.ok) return;

      const students = stuJson.students;

      // 3️⃣ scores_view (⭐ 새로 추가)
      const scoreRes = await fetch(`/api/${id}/scores/getBySubject`);
      const scoreJson = await scoreRes.json();
      if (!scoreRes.ok) return;

      const scoreRows = scoreJson.data ?? [];

      // 4️⃣ StudentCardData 재구성
      const cards: StudentCardData[] = students.map((stu: any) => {
        const myScores = scoreRows.filter((r: any) => r.student_id === stu.id);
        console.log("categories:", categories);
        console.log("students raw:", stuJson);
        console.log("scores:", scoreRows);

        return {
          id: stu.id,
          name: stu.name,
          student_number: stu.student_number,
          class_number: stu.class_number,
          created_at: stu.created_at,

          scores: categories.map((c: any) => {
            const row = myScores.find((r: any) => r.category_id === c.id);
            return {
              category_id: c.id,
              category_name: c.name,
              max_score: c.max_score,
              score: row?.score ?? null,
            };
          }),

          total: myScores[0]?.total ?? 0,
          grade: myScores[0]?.grade ?? "-",
        };
      });

      setStudents(cards);
    })();
  }, [id]);

  useEffect(() => {
    if (categories.length === 0) {
      setWeightError(null);
      return;
    }

    const totalWeight = getTotalWeight(categories);

    if (totalWeight !== 100) {
      setWeightError("가중치 합이 100%가 아닙니다.");
    } else {
      setWeightError(null);
    }
  }, [categories]);

  useEffect(() => {
    if (!id || gradingType !== "relative") return;

    fetch(`/api/${id}/relative-grade/list`)
      .then((res) => res.json())
      .then((json) => {
        // ✅ "비어있지 않을 때만" 덮어쓰기
        if (Array.isArray(json.data) && json.data.length > 0) {
          setRelativeConfig(json.data);
        }
      });
  }, [id, gradingType]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        {/* Header */}
        {subject && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
            <p className="mt-1 text-gray-600">
              분반 {subject.class_number ?? "-"} · 수강 인원 {students.length}명
            </p>
          </div>
        )}
        <div className="mb-6 flex items-center justify-between rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">평가 방식</span>

            {/* 절대평가 */}
            <button
              onClick={() => handleChangeGradingType("absolute")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition
        ${
          gradingType === "absolute"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
            >
              절대평가
            </button>

            {/* 상대평가 */}
            <button
              onClick={() => handleChangeGradingType("relative")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition
        ${
          gradingType === "relative"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
            >
              상대평가
            </button>
          </div>

          {/* 상대평가 전용 버튼 */}
          {gradingType === "relative" && (
            <button
              onClick={() => setIsRelativeModalOpen(true)}
              className="rounded-md border border-blue-600 px-4 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
            >
              상대평가 비율 설정
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Categories */}
          <div className="w-80 shrink-0">
            <CategoryPanel
              categories={categories}
              weightError={weightError}
              totalWeight={totalWeight}
              onAdd={() => {
                setEditingCategory(null);
                setIsAddCategoryOpen(true);
              }}
              onEdit={(c) => {
                setEditingCategory(c);
                setIsAddCategoryOpen(true);
              }}
              onDelete={handleDeleteCategory}
            />
          </div>

          {/* Students */}
          <div className="flex-1 rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">학생 목록</h2>

              <div className="flex gap-2">
                {/* 점수 수정 버튼 */}
                {!isEditingScores ? (
                  <button
                    onClick={() => setIsEditingScores(true)}
                    className="rounded-md border px-4 py-2 text-sm"
                  >
                    점수 수정
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingScores(false)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                  >
                    수정 완료
                  </button>
                )}

                {/* 기존 학생 추가 버튼 */}
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
                >
                  + 학생 추가
                </button>
              </div>
            </div>

            <StudentGrid
              students={students}
              editable={isEditingScores}
              onScoreChange={(studentId, categoryId, score) => {
                // 1️⃣ UI 즉시 반영
                setStudents((prev) =>
                  prev.map((stu) =>
                    stu.id !== studentId
                      ? stu
                      : {
                          ...stu,
                          scores: stu.scores.map((s) =>
                            s.category_id === categoryId ? { ...s, score } : s
                          ),
                        }
                  )
                );

                // 2️⃣ DB 저장 → 계산
                fetch(`/api/${id}/scores/upsert`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    student_id: studentId,
                    category_id: categoryId,
                    score,
                  }),
                })
                  .then((res) => {
                    if (!res.ok) throw new Error("score upsert failed");
                    return fetch(`/api/${id}/grades/calculate`, {
                      method: "POST",
                    });
                  })
                  .then((res) => res.json())
                  .then((result) => {
                    const rows = Array.isArray(result)
                      ? result
                      : Array.isArray(result?.data)
                      ? result.data
                      : [];

                    setStudents((prev) =>
                      prev.map((stu) => {
                        const r = rows.find(
                          (x: any) => x.student_id === stu.id
                        );
                        return r
                          ? { ...stu, total: r.total, grade: r.grade }
                          : stu;
                      })
                    );
                  })
                  .catch(console.error);
              }}
            />
          </div>
        </div>
      </main>

      {/* Student Modal */}
      <StudentAddModal
        isOpen={isStudentModalOpen}
        subjectId={id as string}
        onClose={() => setIsStudentModalOpen(false)}
        onCreated={(student) => {
          setStudents((prev) => {
            if (prev.some((s) => s.id === student.id)) return prev;
            return [...prev, toStudentCardData(student, categories)];
          });
        }}
      />

      {/* Category Modal */}
      {isAddCategoryOpen && (
        <AddCategoryModal
          initialValue={editingCategory}
          onClose={() => {
            setIsAddCategoryOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSubmitCategory}
        />
      )}
      <RelativeGradeCutModal
        isOpen={isRelativeModalOpen}
        config={relativeConfig}
        onChange={setRelativeConfig}
        onClose={() => setIsRelativeModalOpen(false)}
        onSave={async () => {
          await fetch(`/api/${id}/relative-grade/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config: relativeConfig }),
          });
          setIsRelativeModalOpen(false);
        }}
      />
    </div>
  );
}
