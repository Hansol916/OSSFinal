import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query; // ← 여기!

  const { data, error } = await supabaseAdmin
    .from("scores_view")
    .select("*")
    .eq("subject_id", id);

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ data });
}
