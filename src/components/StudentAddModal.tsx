import { useEffect, useState } from "react";

interface Student {
  id: number;
  name: string;
  student_number: string;
  class_number: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  subjectId: string;
  onClose: () => void;
  onCreated: (student: Student) => void;
}

export default function StudentAddModal({
  isOpen,
  subjectId,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Enter / ESC 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, name, studentNumber, classNumber]);

  if (!isOpen) return null;

  // ✅ 실제 저장 로직
  const handleSubmit = async () => {
    if (!name || !studentNumber || !classNumber) {
      alert("모든 값을 입력해주세요");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/${subjectId}/students/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          student_number: studentNumber,
          class_number: classNumber,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error ?? "학생 추가 실패");
        return;
      }

      // ✅ 부모에 DB에서 생성된 student 전달
      onCreated(json.student);

      // 입력값 초기화
      setName("");
      setStudentNumber("");
      setClassNumber("");

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-black">학생 추가</h2>

        <div className="space-y-3">
          <input
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <input
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="학번"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />

          <input
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="분반 (예: 01)"
            value={classNumber}
            onChange={(e) => setClassNumber(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "추가 중..." : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
