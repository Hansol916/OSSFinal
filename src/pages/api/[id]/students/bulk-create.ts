import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const subjectId = Number(req.query.id);
  const { students } = req.body;

  if (!subjectId || !Array.isArray(students)) {
    return res.status(400).json({ error: "invalid request" });
  }

  // 1️⃣ 기존 학생 조회 (학번 기준)
  const studentNumbers = students.map((s) => s.student_number);

  const { data: existing } = await supabaseAdmin
    .from("students")
    .select("id, student_number")
    .in("student_number", studentNumbers);

  const existingSet = new Set(existing?.map((s) => s.student_number) ?? []);

  // 2️⃣ 신규 / 중복 분리
  const newStudents = students.filter(
    (s) => !existingSet.has(s.student_number)
  );

  // 3️⃣ 신규 학생 insert
  let insertedStudents: any[] = [];

  if (newStudents.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("students")
      .insert(newStudents)
      .select();

    if (error) {
      return res.status(500).json({ error });
    }

    insertedStudents = data ?? [];
  }

  // 4️⃣ subject_students 연결 (신규 + 기존)
  const allStudentIds = [...(existing ?? []), ...insertedStudents].map((s) => ({
    subject_id: subjectId,
    student_id: s.id,
  }));

  await supabaseAdmin.from("subject_students").insert(allStudentIds);

  // 5️⃣ 결과 반환
  res.status(200).json({
    added: insertedStudents.length,
    skipped: students.length - insertedStudents.length,
    students: insertedStudents,
  });
}
