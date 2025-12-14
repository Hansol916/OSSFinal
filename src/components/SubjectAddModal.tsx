import { useState, useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    class_number: string;
    grading_type: "absolute" | "relative";
  }) => void;
  initialValue?: {
    name: string;
    class_number: string | null;
    grading_type: "absolute" | "relative";
  };
}

export default function SubjectAddModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue,
}: Props) {
  const [name, setName] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [gradingType, setGradingType] = useState<"absolute" | "relative">(
    "absolute"
  );

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // ESC / Enter 처리
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit({
          name,
          class_number: classNumber,
          grading_type: gradingType,
        });
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, name, classNumber, gradingType, onClose, onSubmit]);

  // 초기값 세팅 + autofocus
  useEffect(() => {
    if (!isOpen) return;

    setName(initialValue?.name ?? "");
    setClassNumber(initialValue?.class_number ?? "");
    setGradingType(initialValue?.grading_type ?? "absolute");

    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-xl bg-white p-6 shadow-lg">
        {/* 헤더 */}
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          {initialValue ? "과목 수정" : "과목 추가"}
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          과목 기본 정보를 입력하세요
        </p>

        {/* 과목명 */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            과목명
          </label>
          <input
            ref={nameInputRef}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="예: 자료구조"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 분반 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            분반
          </label>
          <input
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="예: 01"
            value={classNumber}
            onChange={(e) => setClassNumber(e.target.value)}
          />
        </div>

        {/* 평가 방식 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            평가 방식
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGradingType("absolute")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                gradingType === "absolute"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              절대평가
            </button>
            <button
              type="button"
              onClick={() => setGradingType("relative")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                gradingType === "relative"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              상대평가
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={() =>
              onSubmit({
                name,
                class_number: classNumber,
                grading_type: gradingType,
              })
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            {initialValue ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
