export const RELATIVE_GRADES = [
  "A+",
  "A0",
  "B+",
  "B0",
  "C+",
  "C0",
  "D+",
  "D0",
  "F",
] as const;

export type RelativeGrade = (typeof RELATIVE_GRADES)[number];
