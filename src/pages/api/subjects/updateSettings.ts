import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { removeNulls } from "@/lib/utils";

interface UpdateSettingsBody {
  id: number;
  grading_type?: "absolute" | "relative";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "Method not allowed" });

  const { id, grading_type } = req.body as UpdateSettingsBody;

  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const { data, error } = await supabase
    .from("subjects")
    .update(removeNulls({ grading_type }))
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ data });
}
