import { useEffect } from "react";
import { RelativeGradeConfig } from "@/types/relativeGrade";

interface Props {
  isOpen: boolean;
  config: RelativeGradeConfig | null;
  onChange: (next: RelativeGradeConfig) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function RelativeGradeCutModal({
  isOpen,
  config,
  onChange,
  onClose,
  onSave,
}: Props) {
  if (!isOpen || !config) return null;

  // ✅ 유효성 검사
  const isValid =
    config.length > 0 &&
    config[config.length - 1].maxPercent === 100 &&
    config.every((c, i) => i === 0 || c.maxPercent > config[i - 1].maxPercent);

  // ✅ Enter / ESC 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && isValid) onSave();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isValid, onClose, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* 제목 */}
        <h2 className="mb-5 text-lg font-bold text-gray-900">
          상대평가 컷 기준 설정
        </h2>

        {/* 컷 입력 리스트 */}
        <div className="space-y-3">
          {config.map((item, idx) => (
            <div key={item.grade} className="flex items-center justify-between">
              <span className="w-12 text-sm font-semibold text-gray-900">
                {item.grade}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">상위</span>

                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.maxPercent}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    onChange(
                      config.map((c, i) =>
                        i === idx ? { ...c, maxPercent: value } : c
                      )
                    );
                  }}
                  className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-right text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 경고 */}
        {!isValid && (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            ⚠️ 컷은 오름차순이어야 하며, 마지막 등급은 100%여야 합니다.
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            취소
          </button>

          <button
            disabled={!isValid}
            onClick={onSave}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition
              ${
                isValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
