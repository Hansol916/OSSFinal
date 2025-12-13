export interface Category {
  id: number;
  subject_id: number;
  name: string; // 예: "퀴즈1", "중간고사"
  max_score: number; // 만점
  weight: number; // 반영 비중 (%)
  created_at: string;
}
