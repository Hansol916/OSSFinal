import { useEffect, useState } from "react";
import { Category } from "@/types/category";

interface Props {
  initialValue?: Category | null;
  onClose: () => void;
  onSubmit: (data: { name: string; max_score: number; weight: number }) => void;
}

export default function AddCategoryModal({
  initialValue,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [maxScore, setMaxScore] = useState(initialValue?.max_score ?? 10);
  const [weight, setWeight] = useState(initialValue?.weight ?? 10);

  // 수정 모드 동기화
  useEffect(() => {
    if (!initialValue) return;
    setName(initialValue.name);
    setMaxScore(initialValue.max_score);
    setWeight(initialValue.weight);
  }, [initialValue]);

  // ESC / Enter 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") {
        onSubmit({
          name,
          max_score: maxScore,
          weight,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [name, maxScore, weight, onClose, onSubmit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        {/* 제목 */}
        <h2 className="mb-5 text-lg font-bold text-gray-900">
          {initialValue ? "성적 항목 수정" : "성적 항목 추가"}
        </h2>

        {/* 입력 영역 */}
        <div className="space-y-4">
          {/* 항목명 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              항목명
            </label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white
                         px-3 py-2 text-sm text-gray-900 placeholder-gray-400
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="예: 중간고사"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 만점 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              만점
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-gray-300 bg-white
                         px-3 py-2 text-sm text-gray-900
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
            />
          </div>

          {/* 가중치 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              성적 반영 비율 (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              className="w-full rounded-md border border-gray-300 bg-white
                         px-3 py-2 text-sm text-gray-900
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            취소
          </button>
          <button
            onClick={() =>
              onSubmit({
                name,
                max_score: maxScore,
                weight,
              })
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {initialValue ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
