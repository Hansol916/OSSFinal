export interface Score {
  id: number;
  category_id: number;
  student_id: number;
  score: number | null; // 학생이 점수를 아직 입력 안 했을 수 있음
  created_at: string;
}
