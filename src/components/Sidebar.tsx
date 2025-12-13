export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r border-gray-200 bg-white px-6 py-8 flex flex-col">
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
        <p className="text-gray-700 font-medium">교수님 환영합니다</p>
      </div>

      <nav className="flex flex-col gap-3">
        <button className="w-full py-2 rounded-lg text-left bg-blue-600 text-white hover:bg-blue-700 transition">
          과목 추가
        </button>

        <button className="w-full py-2 rounded-lg text-left bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          LMS
        </button>

        <button className="w-full py-2 rounded-lg text-left bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          Hisnet
        </button>

        <button className="w-full py-2 rounded-lg text-left bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          로그아웃
        </button>
      </nav>
    </aside>
  );
}
