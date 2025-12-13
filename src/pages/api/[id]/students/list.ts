import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const subjectId = req.query.id as string;

  if (!subjectId) {
    return res.status(400).json({ error: "subjectId is required" });
  }

  try {
    // subject_students → students JOIN
    const { data, error } = await supabaseAdmin
      .from("subject_students")
      .select(
        `
        student_id,
        students (
          id,
          name,
          student_number,
          class_number,
          created_at
        )
      `
      )
      .eq("subject_id", subjectId);

    if (error) throw error;

    // join 결과 정리
    const students = (data ?? [])
      .map((row: any) => row.students)
      .filter(Boolean);

    return res.status(200).json({ students });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
