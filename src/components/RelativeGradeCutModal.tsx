import { useEffect } from "react";
import { RelativeGradeConfig } from "@/types/relativeGrade";

interface Props {
  isOpen: boolean;
  config: RelativeGradeConfig;
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
  if (!isOpen) return null;

  // ✅ 유효성 검사
  const isValid =
    config.length > 0 &&
    config[config.length - 1].maxPercent === 100 &&
    config.every((c, i) => i === 0 || c.maxPercent > config[i - 1].maxPercent);

  // ✅ Enter / ESC 처리 (StudentAddModal 패턴)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Enter" && isValid) {
        onSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isValid, onClose, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">상대평가 컷 기준 설정</h2>

        {/* 컷 입력 */}
        <div className="space-y-3">
          {config.map((item, idx) => (
            <div key={item.grade} className="flex justify-between items-center">
              <span className="font-medium w-10">{item.grade}</span>

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
                  className="w-20 rounded border px-2 py-1 text-right"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 경고 문구 */}
        {!isValid && (
          <div className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            ⚠️ 컷은 오름차순이어야 하며, 마지막 등급은 100%여야 합니다.
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
            취소
          </button>
          <button
            disabled={!isValid}
            onClick={onSave}
            className={`px-4 py-2 text-sm text-white rounded
              ${isValid ? "bg-blue-600" : "bg-gray-300"}`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
