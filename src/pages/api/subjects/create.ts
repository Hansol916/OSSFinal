import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { name, class_number } = req.body;

  const { data, error } = await supabase
    .from("subjects")
    .insert([{ name, class_number }])
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  return res.status(200).json({ data });
}
