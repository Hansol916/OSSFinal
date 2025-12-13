import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SubjectCard from "@/components/SubjectCard";
import { supabase } from "@/lib/supabase";

interface Subject {
  id: number;
  name: string;
  class_number: string | null;
  studentCount: number;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchSubjectsWithCount();
  }, []);

  const fetchSubjectsWithCount = async () => {
    const { data: subjectData, error } = await supabase
      .from("subjects")
      .select("id, name, class_number");

    console.log("subjects from db:", subjectData, error);

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

    console.log("subjects with count:", subjectsWithCount);
    setSubjects(subjectsWithCount);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 px-16 py-12">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">과목 목록</h1>
          <button className="px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition">
            + 새 과목
          </button>
        </div>

        {/* 과목 카드 */}
        {subjects.length === 0 ? (
          <p className="text-gray-600">아직 생성된 과목이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((s) => (
              <SubjectCard
                key={s.id}
                id={s.id}
                name={s.name}
                classNumber={s.class_number ?? undefined}
                studentCount={s.studentCount}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
