import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SubjectCard from "@/components/SubjectCard";
import { supabase } from "@/lib/supabase";
import SubjectAddModal from "@/components/SubjectAddModal";

interface Subject {
  id: number;
  name: string;
  class_number: string | null;
  studentCount: number;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    fetchSubjectsWithCount();
  }, []);

  const fetchSubjectsWithCount = async () => {
    const { data: subjectData, error } = await supabase
      .from("subjects")
      .select("id, name, class_number");

    if (!subjectData) return;

    const subjectsWithCount = await Promise.all(
      subjectData.map(async (subject) => {
        const { count } = await supabase
          .from("subject_students")
          .select("*", { count: "exact", head: true })
          .eq("subject_id", subject.id);

        return {
          id: subject.id,
          name: subject.name,
          class_number: subject.class_number,
          studentCount: count ?? 0,
        };
      })
    );

    setSubjects(subjectsWithCount);
  };

  const handleDeleteSubject = async (id: number) => {
    const ok = confirm(
      "이 과목을 삭제하면 학생, 성적, 점수 데이터가 모두 삭제됩니다.\n정말 삭제하시겠습니까?"
    );
    if (!ok) return;

    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      alert("과목 삭제 실패");
      return;
    }

    // UI 즉시 반영
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 px-10 py-10">
        {/* 헤더 */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">과목 목록</h1>
            <p className="mt-1 text-sm text-gray-600">
              담당 과목을 생성하고 성적을 관리하세요
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            + 새 과목
          </button>
        </div>

        {/* 과목 카드 */}
        {subjects.length === 0 ? (
          <p className="text-gray-600">아직 생성된 과목이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {subjects.map((s) => (
              <SubjectCard
                key={s.id}
                id={s.id}
                name={s.name}
                classNumber={s.class_number ?? undefined}
                studentCount={s.studentCount}
                onDelete={handleDeleteSubject}
                onEdit={(id) => {
                  const subject = subjects.find((s) => s.id === id);
                  if (!subject) return;

                  setEditingSubject(subject);
                  setIsAddOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>
      <SubjectAddModal
        isOpen={isAddOpen}
        initialValue={
          editingSubject
            ? {
                name: editingSubject.name,
                class_number: editingSubject.class_number,
                grading_type: "absolute",
              }
            : undefined
        }
        onClose={() => {
          setIsAddOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={async (data) => {
          if (editingSubject) {
            const { error } = await supabase
              .from("subjects")
              .update(data)
              .eq("id", editingSubject.id);

            if (error) {
              alert("과목 수정 실패");
              return;
            }

            setSubjects((prev) =>
              prev.map((s) =>
                s.id === editingSubject.id ? { ...s, ...data } : s
              )
            );
          } else {
            const { data: inserted, error } = await supabase
              .from("subjects")
              .insert(data)
              .select()
              .single();

            if (error) {
              alert("과목 추가 실패");
              return;
            }

            setSubjects((prev) => [
              {
                id: inserted.id,
                name: inserted.name,
                class_number: inserted.class_number,
                studentCount: 0,
              },
              ...prev,
            ]);
          }

          setIsAddOpen(false);
          setEditingSubject(null); // ⭐ 중요
        }}
      />
    </div>
  );
}
