import { Category } from "@/types/category";
import { StudentCardData } from "@/types/studentCard";

export function toStudentCardData(
  student: {
    id: number;
    name: string;
    student_number: string;

    created_at: string;
  },
  categories: Category[]
): StudentCardData {
  return {
    id: student.id,
    name: student.name,
    student_number: student.student_number,

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

export function getCategoryAverages(
  categories: Category[],
  students: StudentCardData[]
): Record<number, number | null> {
  const result: Record<number, number | null> = {};

  categories.forEach((cat) => {
    let sum = 0;
    const totalStudents = students.length;

    students.forEach((stu) => {
      const cell = stu.scores.find((s) => s.category_id === cat.id);

      // 점수 없으면 0점으로 처리
      const score = cell?.score ?? 0;
      sum += Number(score);
    });

    result[cat.id] =
      totalStudents === 0 ? null : Number((sum / totalStudents).toFixed(1));
  });

  return result;
}
