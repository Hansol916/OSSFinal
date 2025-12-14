import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
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
import { toStudentCardData, getCategoryAverages } from "@/lib/subjectDetail";

export default function SubjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [subject, setSubject] = useState<Subject | null>(null);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/subjects/get?id=${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.data) return;

        setSubject(json.data);
        setGradingType((prev) =>
          prev === null ? json.data.grading_type : prev
        ); //동기화
      });
  }, [id]);

  //State
  const [students, setStudents] = useState<StudentCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const totalWeight = getTotalWeight(categories);
  const categoryAverages = getCategoryAverages(categories, students);

  const [gradingType, setGradingType] = useState<
    "absolute" | "relative" | null
  >(null);
  const [isRelativeModalOpen, setIsRelativeModalOpen] = useState(false);

  const [relativeConfig, setRelativeConfig] =
    useState<RelativeGradeConfig | null>(null);

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
      // ⭐ 5️⃣ 최초 진입 시 총점/등급 계산
      const gradeRes = await fetch(`/api/${id}/grades/calculate`, {
        method: "POST",
      });
      const gradeJson = await gradeRes.json();

      const rows = Array.isArray(gradeJson.result) ? gradeJson.result : [];

      setStudents((prev) =>
        prev.map((stu) => {
          const r = rows.find((x: any) => x.student_id === stu.id);
          return r ? { ...stu, total: r.total, grade: r.grade } : stu;
        })
      );
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
    if (relativeConfig !== null) return; // ✅ 이미 있으면 덮지 않음

    fetch(`/api/${id}/relative-grade/list`)
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.data) && json.data.length > 0) {
          // DB에 설정이 있으면 사용
          setRelativeConfig(json.data);
        } else {
          // DB에 없으면 기본 템플릿 생성
          setRelativeConfig(
            RELATIVE_GRADES.map((grade, idx, arr) => ({
              grade,
              maxPercent: idx === arr.length - 1 ? 100 : 0,
            }))
          );
        }
      });
  }, [id, gradingType, relativeConfig]);

  async function handleAddStudentsFromExcel(
    rows: { name: string; student_number: string }[]
  ) {
    if (!id || rows.length === 0) return;

    const res = await fetch(`/api/${id}/students/bulk-create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: rows }),
    });

    if (!res.ok) {
      alert("엑셀 학생 추가 실패");
      return;
    }

    const { added, skipped, students } = await res.json();

    // ✅ UI 즉시 반영
    setStudents((prev) => [
      ...prev,
      ...students.map((s: any) => toStudentCardData(s, categories)),
    ]);

    alert(`학생 ${added}명 추가됨 (${skipped}명 중복으로 건너뜀)`);
  }

  return (
    <div className="flex h-screen bg-gray-50 min-h-screen ">
      <Sidebar />

      <main className="flex-1 min-h-screen px-10 py-8 flex flex-col">
        {/* Header */}
        {subject && (
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {subject.name}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              분반{" "}
              <span className="text-gray-700 font-medium">
                {subject.class_number ?? "-"}
              </span>
              <span className="mx-2">·</span>
              수강 인원{" "}
              <span className="text-gray-700 font-medium">
                {students.length}명
              </span>
            </p>
          </div>
        )}
        <div className="mb-6 flex items-center justify-between rounded-xl border bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              평가 방식
            </span>

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

        <div className="flex gap-8 flex-1 min-h-0 items-stretch">
          {/* Categories */}
          <div className="w-80 shrink-0 flex flex-col">
            <div className="flex-1">
              <CategoryPanel
                categories={categories}
                weightError={weightError}
                totalWeight={totalWeight}
                categoryAverages={categoryAverages}
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
          </div>

          {/* Students */}
          <div
            className="flex-1 rounded-lg border bg-white p-6 shadow-sm flex flex-col"
            style={{ height: "110vh" }}
          >
            <StudentGrid
              students={students}
              onAddStudent={() => setIsStudentModalOpen(true)}
              onAddStudentsFromExcel={handleAddStudentsFromExcel}
              onDeleteStudent={async (studentId) => {
                const ok = confirm("이 학생을 과목에서 제거하시겠습니까?");
                if (!ok) return;

                const res = await fetch(
                  `/api/${id}/students/delete?student_id=${studentId}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ student_id: studentId }),
                  }
                );

                if (!res.ok) {
                  alert("학생 제거 실패");
                  return;
                }

                // UI 즉시 반영
                setStudents((prev) => prev.filter((s) => s.id !== studentId));
              }}
              onScoreChange={async (studentId, categoryId, score) => {
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

                // 2️⃣ 점수 저장
                const upsertRes = await fetch(`/api/${id}/scores/upsert`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    student_id: studentId,
                    category_id: categoryId,
                    score,
                  }),
                });

                if (!upsertRes.ok) return;

                // 3️⃣ 총점 / 등급 재계산
                const gradeRes = await fetch(`/api/${id}/grades/calculate`, {
                  method: "POST",
                });
                const gradeJson = await gradeRes.json();

                const rows = Array.isArray(gradeJson.result)
                  ? gradeJson.result
                  : [];

                setStudents((prev) =>
                  prev.map((stu) => {
                    const r = rows.find((x: any) => x.student_id === stu.id);
                    return r ? { ...stu, total: r.total, grade: r.grade } : stu;
                  })
                );
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
          if (!relativeConfig) return; // ✅ null 방어

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
