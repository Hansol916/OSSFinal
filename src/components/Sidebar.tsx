import Link from "next/link";

export default function Sidebar() {
  return (
    <aside
      className="w-64 border-r border-gray-200 bg-white px-6 py-8 flex flex-col"
      style={{ height: "150vh" }}
    >
      {/* 로고 */}
      <Link
        href="/"
        className="mb-10 text-3xl text-gray-900 font-extrabold tracking-tight text-center"
      >
        GRAD<span className="text-blue-600">e</span>R
      </Link>

      {/* 프로필 영역 */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-200">
          <img
            src="/profile.png" // 나중에 교체
            alt="프로필 이미지"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-gray-700 font-medium">김세진 교수님 환영합니다</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-3 text-sm">
        {/* 과목 목록 */}
        <Link
          href="/"
          className="w-full py-2 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          과목 목록
        </Link>

        {/* 전체 성적 요약 */}
        <Link
          href="/summary"
          className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          전체 성적 요약
        </Link>

        {/* 구분선 */}
        <div className="my-3 border-t border-gray-200" />

        {/* LMS */}
        <a
          href="https://lms.handong.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          LMS
        </a>

        {/* Hisnet */}
        <a
          href="https://hisnet.handong.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Hisnet
        </a>

        {/* 구분선 */}
        <div className="my-3 border-t border-gray-200" />

        {/* 성적 내보내기 */}
        <button
          disabled
          className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
          title="준비 중인 기능입니다"
        >
          성적 내보내기
        </button>

        {/* 로그아웃 */}
        <button className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          로그아웃
        </button>
      </nav>
    </aside>
  );
}
