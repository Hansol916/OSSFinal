import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { id } = req.query;

  const { data, error } = await supabaseAdmin
    .from("relative_grade_configs")
    .select("grade, max_percent")
    .eq("subject_id", id)
    .order("max_percent", { ascending: true });

  if (error) {
    return res.status(400).json({ error });
  }

  // UI에서 쓰기 좋게 변환
  const config = data.map((row) => ({
    grade: row.grade,
    maxPercent: row.max_percent,
  }));

  return res.status(200).json({ data: config });
}
