import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.body;

  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ success: true });
}
