import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query; // subject_id
  const { name, max_score, weight } = req.body;

  if (!id || !name || !max_score || !weight) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert([
      {
        subject_id: Number(id),
        name,
        max_score,
        weight,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ data });
}
