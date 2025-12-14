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

// fallback (DB에 상대평가 설정 없을 때만 사용)
const DEFAULT_RELATIVE_CONFIG: RelativeGradeConfig = [
  { grade: "A+", maxPercent: 5 },
  { grade: "A0", maxPercent: 20 },
  { grade: "B+", maxPercent: 30 },
  { grade: "B0", maxPercent: 40 },
  { grade: "C+", maxPercent: 50 },
  { grade: "C0", maxPercent: 60 },
  { grade: "D+", maxPercent: 70 },
  { grade: "D0", maxPercent: 95 },
  { grade: "F", maxPercent: 100 },
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

  /* ----------------------------------
   * 1️⃣ 과목 평가 방식 조회
   * ---------------------------------- */
  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("grading_type")
    .eq("id", subjectId)
    .single();

  if (subjectError || !subject) {
    return res.status(400).json({ error: subjectError ?? "Subject not found" });
  }

  const gradingType = subject.grading_type as "absolute" | "relative";

  /* ----------------------------------
   * 2️⃣ 상대평가 비율 조회 (별도 테이블)
   * ---------------------------------- */
  let relativeConfig: RelativeGradeConfig = DEFAULT_RELATIVE_CONFIG;

  if (gradingType === "relative") {
    const { data: configRows } = await supabaseAdmin
      .from("relative_grade_configs")
      .select("grade, max_percent")
      .eq("subject_id", subjectId)
      .order("max_percent", { ascending: true });

    if (configRows && configRows.length > 0) {
      relativeConfig = configRows.map((row) => ({
        grade: row.grade,
        maxPercent: row.max_percent,
      }));
    }
  }

  /* ----------------------------------
   * 3️⃣ 점수 JOIN 데이터 조회
   * (RPC or VIEW)
   * ---------------------------------- */
  const { data, error } = await supabaseAdmin.rpc("get_scores_by_subject", {
    p_subject_id: subjectId,
  });

  if (error || !data) {
    return res.status(400).json({ error: error ?? "No score data" });
  }

  const rawRows = data as RawGradeRow[];
  const grouped = groupBy(rawRows, "student_id");

  /* ----------------------------------
   * 4️⃣ 학생별 총점 계산
   * ---------------------------------- */
  const totals = Object.entries(grouped).map(([studentId, rows]) => ({
    student_id: Number(studentId),
    student_name: rows[0]?.student_name ?? "",
    total: calculateTotalScore(rows),
  }));

  /* ----------------------------------
   * 5️⃣ 절대 / 상대 평가 분기
   * ---------------------------------- */
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
