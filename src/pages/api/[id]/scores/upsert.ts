import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toNumber } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { student_id, category_id, score } = req.body;

  const { data, error } = await supabaseAdmin
    .from("scores")
    .upsert([{ student_id, category_id, score: toNumber(score) }], {
      onConflict: "category_id,student_id",
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ data });
}
