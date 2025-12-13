import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { categoryId } = req.query;

  const { data, error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", Number(categoryId))
    .select();

  if (error) return res.status(400).json({ error });

  return res.status(200).json({ success: true });
}
