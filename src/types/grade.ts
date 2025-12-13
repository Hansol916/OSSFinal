export interface RawGradeRow {
  student_id: number;
  student_name: string;
  category_id: number;
  category_name: string;
  score: number | null;
  max_score: number;
  weight: number;
}
