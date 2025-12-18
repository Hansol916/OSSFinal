import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await supabaseAdmin
    .from("subjects")
    .select("id, name, class_number")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error });
  }

  return res.status(200).json({ data });
}
