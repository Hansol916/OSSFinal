import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const subjectId = req.query.id as string;
  const { name, student_number, class_number } = req.body;

  if (!subjectId || !name || !student_number || !class_number) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    // 1️⃣ 기존 학생 확인 (학번 + 분반)
    const { data: existingStudent, error: findError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("student_number", student_number)
      .eq("class_number", class_number)
      .maybeSingle();

    if (findError) throw findError;

    let student = existingStudent;

    // 2️⃣ 없으면 학생 생성
    if (!student) {
      const { data: insertedStudent, error: insertError } = await supabaseAdmin
        .from("students")
        .insert([{ name, student_number, class_number }])
        .select()
        .single();

      if (insertError) throw insertError;
      student = insertedStudent;
    }

    // 3️⃣ 과목-학생 연결 (중복 안전)
    const { error: linkError } = await supabaseAdmin
      .from("subject_students")
      .upsert(
        {
          subject_id: subjectId,
          student_id: student.id,
        },
        {
          onConflict: "subject_id,student_id",
        }
      );

    if (linkError) throw linkError;

    // 4️⃣ 성공
    return res.status(200).json({ student });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
