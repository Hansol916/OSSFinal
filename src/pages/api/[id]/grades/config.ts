import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query; // ← subject_id
  const subject_id = Number(id);

  const { config } = req.body;

  if (!subject_id || !Array.isArray(config)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // 기존 설정 삭제
  await supabaseAdmin
    .from("relative_grade_configs")
    .delete()
    .eq("subject_id", subject_id);

  // 새 설정 저장
  const insertData = config.map((c) => ({
    subject_id,
    max_percent: c.maxPercent,
    grade: c.grade,
  }));

  const { error } = await supabaseAdmin
    .from("relative_grade_configs")
    .insert(insertData);

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true });
}
