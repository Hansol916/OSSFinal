import { useRef } from "react";
import { parseStudentExcel } from "@/lib/parseStudentExcel";

interface Props {
  onParsed: (students: { name: string; student_number: string }[]) => void;
}

export default function StudentExcelButton({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 transition"
      >
        엑셀로 추가
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const students = await parseStudentExcel(file);
          onParsed(students);

          e.target.value = "";
        }}
      />
    </>
  );
}
