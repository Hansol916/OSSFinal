import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { id } = req.query;
  const { config } = req.body;
  // config: [{ grade, maxPercent }]

  // 1️⃣ 기존 컷 삭제
  await supabaseAdmin
    .from("relative_grade_configs")
    .delete()
    .eq("subject_id", id);

  // 2️⃣ 새 컷 저장
  const rows = config.map((c: any) => ({
    subject_id: id,
    grade: c.grade,
    max_percent: c.maxPercent,
  }));

  const { error } = await supabaseAdmin
    .from("relative_grade_configs")
    .insert(rows);

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true });
}
