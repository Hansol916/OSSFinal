import { RelativeGradeConfig } from "@/types/relativeGrade";

/**
 * DB에서 JOIN으로 가져온 원본 점수 Row 타입
 */
export interface RawGradeRow {
  student_id: number;
  student_name: string;
  category_id: number;
  category_name: string;
  score: number | null;
  max_score: number;
  weight: number; // % 단위 (예: 20)
}

/**
 * 개별 학생 총점 계산 (가중치 반영)
 * - weight는 퍼센트 기준
 * - 결과는 100점 만점 기준 점수
 */
export function calculateTotalScore(rows: RawGradeRow[]): number {
  let total = 0;

  rows.forEach((r) => {
    if (r.score == null) return;

    const ratio = r.score / r.max_score; // 0 ~ 1
    const weightedScore = ratio * r.weight;

    total += weightedScore;
  });

  return Number(total.toFixed(2));
}

/**
 * 절대평가 등급 계산
 */
export function getAbsoluteGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A0";
  if (score >= 85) return "B+";
  if (score >= 80) return "B0";
  if (score >= 75) return "C+";
  if (score >= 70) return "C0";
  if (score >= 65) return "D+";
  if (score >= 60) return "D0";
  return "F";
}

/**
 * 상대평가 등급 계산
 * - totals: 학생별 총점 배열
 * - config: subjects.relative_table 에 저장된 설정
 *
 * 예)
 * [
 *   { grade: "A+", maxPercent: 15 },
 *   { grade: "A0", maxPercent: 30 },
 *   ...
 * ]
 */
export function getCustomRelativeGrades(
  totals: number[],
  config: RelativeGradeConfig
): string[] {
  // 점수 + 원래 인덱스 묶기
  const ranked = totals
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score);

  // index → rank 매핑
  const rankMap = new Map<number, number>();
  ranked.forEach((item, rank) => {
    if (!rankMap.has(item.score)) {
      rankMap.set(item.score, rank); // 동점자는 같은 rank
    }
  });

  return totals.map((score) => {
    const rank = rankMap.get(score)!;
    const percent = (rank / totals.length) * 100;

    for (const c of config) {
      if (percent <= c.maxPercent) {
        return c.grade;
      }
    }

    return "N/A";
  });
}
