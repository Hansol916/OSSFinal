import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { categoryId } = req.query;
  const { name, max_score, weight } = req.body;

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update({
      name,
      max_score,
      weight,
    })
    .eq("id", Number(categoryId))
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ data });
}
