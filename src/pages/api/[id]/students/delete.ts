import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const subjectId = Number(req.query.id);
  const studentId = Number(req.body.student_id);

  if (!subjectId || !studentId) {
    return res.status(400).json({ error: "Invalid request" });
  }

  console.log("DELETE student", { subjectId, studentId });

  const { data, error } = await supabaseAdmin
    .from("subject_students")
    .delete()
    .eq("subject_id", subjectId)
    .eq("student_id", studentId)
    .select();

  if (error) {
    return res.status(500).json({ error });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      error: "No matching subject_students row",
    });
  }

  return res.status(200).json({ success: true });
}
