import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { removeNulls } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "Method not allowed" });

  const { id, ...rest } = req.body;

  const { data, error } = await supabase
    .from("subjects")
    .update(removeNulls(rest))
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ data });
}
