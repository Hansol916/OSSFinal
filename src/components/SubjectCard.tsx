import Link from "next/link";

interface SubjectCardProps {
  id: number;
  name: string;
  classNumber?: string;
  studentCount?: number;
}

export default function SubjectCard({
  id,
  name,
  classNumber,
  studentCount,
}: SubjectCardProps) {
  return (
    <Link href={`/subjects/${id}`}>
      <div className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-300">
        {/* 상단 */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
            {name}
          </h2>

          {/* 설정 아이콘 자리 (나중에 버튼으로 확장 가능) */}
          <span className="text-gray-400 group-hover:text-gray-600">⚙</span>
        </div>

        {/* 부가 정보 */}
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          {classNumber && <p>분반: {classNumber}</p>}
          {studentCount !== undefined && <p>수강 인원: {studentCount}명</p>}
        </div>
      </div>
    </Link>
  );
}
