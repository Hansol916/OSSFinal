import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Subject } from "@/types/subject";

interface SubjectCardProps {
  id: number;
  name: string;
  classNumber?: string;
  studentCount?: number;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export default function SubjectCard({
  id,
  name,
  classNumber,
  studentCount,
  onDelete,
  onEdit,
}: SubjectCardProps) {
  //state for menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <Link href={`/subjects/${id}`}>
      <div className="relative group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-300">
        {/* 상단 */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
            {name}
          </h2>

          <button
            onClick={(e) => {
              e.preventDefault(); // Link 이동 방지
              e.stopPropagation(); // 카드 클릭 방지
              setIsMenuOpen((prev) => !prev);
            }}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ⚙
          </button>
          {isMenuOpen && (
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-6 top-14 z-10 w-32 rounded-md border bg-white shadow"
            >
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onEdit?.(id);
                }}
              >
                과목 수정
              </button>

              <button
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(id);
                }}
              >
                과목 삭제
              </button>
            </div>
          )}
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
