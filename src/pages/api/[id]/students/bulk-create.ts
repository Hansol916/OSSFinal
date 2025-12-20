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

  try {
    // 1️⃣ 엑셀에 들어온 학번 목록
    const studentNumbers = students.map((s) => s.student_number);

    // 2️⃣ students 테이블에서 이미 존재하는 학생 조회
    const { data: existingStudents } = await supabaseAdmin
      .from("students")
      .select("id, student_number")
      .in("student_number", studentNumbers);

    const studentMap = new Map<string, string>();
    existingStudents?.forEach((s) => {
      studentMap.set(s.student_number, s.id);
    });

    // 3️⃣ 아직 없는 학생만 insert 시도 (중복 학번 방지)
    const newStudents = students.filter(
      (s) => !studentMap.has(s.student_number)
    );

    if (newStudents.length > 0) {
      const { data: inserted } = await supabaseAdmin
        .from("students")
        .insert(newStudents)
        .select("id, student_number");

      inserted?.forEach((s) => {
        studentMap.set(s.student_number, s.id);
      });
    }

    // 4️⃣ 이미 이 과목에 등록된 학생 조회
    const { data: alreadyLinked } = await supabaseAdmin
      .from("subject_students")
      .select("student_id")
      .eq("subject_id", subjectId);

    const alreadySet = new Set(alreadyLinked?.map((s) => s.student_id) ?? []);

    // 5️⃣ subject_students 연결 (중복 제거)
    const toConnect = Array.from(studentMap.values())
      .filter((studentId) => !alreadySet.has(studentId))
      .map((studentId) => ({
        subject_id: subjectId,
        student_id: studentId,
      }));

    if (toConnect.length > 0) {
      await supabaseAdmin.from("subject_students").insert(toConnect);
    }

    // 6️⃣ 결과 반환 (의미 정확)
    return res.status(200).json({
      added: toConnect.length,
      skipped: students.length - toConnect.length,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "bulk create failed" });
  }
}
