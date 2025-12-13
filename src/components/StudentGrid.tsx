import StudentCard from "@/components/StudentCard";
import { StudentCardData } from "@/types/studentCard";

interface Props {
  students: StudentCardData[];
  editable: boolean;
  onScoreChange: (studentId: number, categoryId: number, score: number) => void;
}

export default function StudentGrid({
  students,
  editable,
  onScoreChange,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          editable={editable}
          onScoreChange={onScoreChange}
        />
      ))}

      {students.length === 0 && (
        <p className="col-span-full text-sm text-gray-400">
          아직 등록된 학생이 없습니다.
        </p>
      )}
    </div>
  );
}
