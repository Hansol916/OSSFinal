export interface Subject {
  id: number;
  name: string;
  class_number: string | null;
  created_at: string;
  studentCount: number;
}
export interface SubjectDetail extends Subject {
  grading_type: "absolute" | "relative";
}
