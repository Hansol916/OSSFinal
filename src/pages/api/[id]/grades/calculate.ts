import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateTotalScore,
  getAbsoluteGrade,
  getCustomRelativeGrades,
  RawGradeRow,
} from "@/lib/grade";
import { groupBy } from "@/lib/utils";
import { RelativeGradeConfig } from "@/types/relativeGrade";

interface GradeResult {
  student_id: number;
  student_name: string;
  total: number;
  grade: string;
}

// 기본 상대평가 fallback
const DEFAULT_RELATIVE_CONFIG: RelativeGradeConfig = [
  { grade: "A+", maxPercent: 15 },
  { grade: "A0", maxPercent: 30 },
  { grade: "B+", maxPercent: 60 },
  { grade: "B0", maxPercent: 85 },
  { grade: "C", maxPercent: 100 },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ result?: GradeResult[]; error?: any }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const subjectId = Number(req.query.id);
  if (!subjectId) {
    return res.status(400).json({ error: "Invalid subject id" });
  }

  /**
   * 1️⃣ 과목 설정 조회
   */
  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("grading_type, relative_table")
    .eq("id", subjectId)
    .single();

  if (subjectError || !subject) {
    return res.status(400).json({ error: subjectError ?? "Subject not found" });
  }

  const gradingType = subject.grading_type as "absolute" | "relative";

  const relativeConfig: RelativeGradeConfig =
    gradingType === "relative" && Array.isArray(subject.relative_table)
      ? (subject.relative_table as RelativeGradeConfig)
      : DEFAULT_RELATIVE_CONFIG;

  /**
   * 2️⃣ 점수 JOIN 데이터 조회
   */
  const { data, error } = await supabaseAdmin.rpc("get_scores_by_subject", {
    p_subject_id: subjectId,
  });

  if (error || !data) {
    return res.status(400).json({ error: error ?? "No score data" });
  }

  const rawRows = data as RawGradeRow[];
  const grouped = groupBy(rawRows, "student_id");

  /**
   * 3️⃣ 학생별 총점 계산
   */
  const totals = Object.entries(grouped).map(([studentId, rows]) => {
    const total = calculateTotalScore(rows);
    return {
      student_id: Number(studentId),
      student_name: rows[0]?.student_name ?? "",
      total,
    };
  });

  /**
   * 4️⃣ 절대 / 상대 평가 분기
   */
  let result: GradeResult[];

  if (gradingType === "relative") {
    const totalScores = totals.map((t) => t.total);
    const grades = getCustomRelativeGrades(totalScores, relativeConfig);

    result = totals.map((t, i) => ({
      ...t,
      grade: grades[i],
    }));
  } else {
    result = totals.map((t) => ({
      ...t,
      grade: getAbsoluteGrade(t.total),
    }));
  }

  return res.status(200).json({ result });
}
