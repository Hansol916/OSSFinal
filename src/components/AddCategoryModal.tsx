import { useEffect, useState } from "react";
import { Category } from "@/types/category";

interface Props {
  initialValue?: Category | null; // ⭐ 이거 없으면 전부 빨간줄
  onClose: () => void;
  onSubmit: (data: { name: string; max_score: number; weight: number }) => void;
}

export default function AddCategoryModal({
  initialValue,
  onClose,
  onSubmit,
}: Props) {
  // ⭐ initialValue를 여기서 사용하므로 Props에 반드시 있어야 함
  const [name, setName] = useState(initialValue?.name ?? "");
  const [maxScore, setMaxScore] = useState(initialValue?.max_score ?? 10);
  const [weight, setWeight] = useState(initialValue?.weight ?? 10);

  // 수정 모드에서 값 동기화
  useEffect(() => {
    if (initialValue) {
      setName(initialValue.name);
      setMaxScore(initialValue.max_score);
      setWeight(initialValue.weight);
    }
  }, [initialValue]);
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Enter") {
        onSubmit({
          name,
          max_score: maxScore,
          weight,
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [name, maxScore, weight, onClose, onSubmit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[360px] rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          {initialValue ? "성적 항목 수정" : "성적 항목 추가"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              항목명
            </label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              만점
            </label>
            <input
              type="number"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              성적 반영 비율 (%)
            </label>
            <input
              type="number"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            {initialValue ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
