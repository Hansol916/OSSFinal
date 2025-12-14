import * as XLSX from "xlsx";

export interface ExcelStudent {
  name: string;
  student_number: string;
}

export function parseStudentExcel(file: File): Promise<ExcelStudent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      const students: ExcelStudent[] = rows
        .map((row) => ({
          name: String(row["이름"] ?? "").trim(),
          student_number: String(row["학번"] ?? "").trim(),
        }))
        .filter((s) => s.name && s.student_number);

      resolve(students);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
