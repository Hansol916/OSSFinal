import { Student } from "@/types/student";

/**
 * 한 학생의 한 성적 항목 점수
 */
export interface StudentScore {
  category_id: number;
  category_name: string;
  score: number | null;
  max_score: number;
}

/**
 * 교수 화면에서 사용하는 "완성된 학생 카드 데이터"
 */
export interface StudentCardData extends Student {
  scores: StudentScore[];
  total: number; // 가중치 반영 총점 (0~100)
  grade: string; // A+, B0 등
}
