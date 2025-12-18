import Link from "next/link";
import { useEffect, useState } from "react";
import { getWeather, WeatherData } from "@/lib/getWeather";
import {
  CloudRain,
  Sun,
  LogOut,
  BarChart3,
  BookOpen,
  ExternalLink,
} from "lucide-react";

export default function Sidebar() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    getWeather().then(setWeather);
  }, []);

  return (
    <aside
      className="w-64 border-r border-gray-200 bg-white px-6 py-8 flex flex-col"
      style={{ height: "150vh" }} // 네가 이미 컨트롤 중인 값
    >
      {/* 로고 */}
      <Link
        href="/"
        className="mb-10 text-3xl text-gray-900 font-extrabold tracking-tight text-center"
      >
        GRAD<span className="text-blue-600">e</span>R
      </Link>

      {/* 프로필 */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-200">
          <img
            src="/profile.png"
            alt="프로필 이미지"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-gray-700 font-medium">김세진 교수님 환영합니다</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-3 text-sm">
        <Link
          href="/"
          className="flex items-center gap-2 w-full py-2 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <BookOpen size={16} />
          과목 목록
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          <BarChart3 size={16} />
          전체 성적 요약
        </Link>

        <div className="my-3 border-t border-gray-200" />

        <a
          href="https://lms.handong.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          <ExternalLink size={16} />
          LMS
        </a>

        <a
          href="https://hisnet.handong.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          <ExternalLink size={16} />
          Hisnet
        </a>

        <div className="mt-auto pt-6">
          {weather ? (
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 px-4 py-3 text-sm text-gray-700 border">
              {weather.rainProbability >= 50 ? (
                <CloudRain className="text-blue-500" size={22} />
              ) : (
                <Sun className="text-yellow-500" size={22} />
              )}
              <div className="leading-tight">
                <p className="font-medium">포항</p>
                <p className="text-xs text-gray-600">
                  {weather.temp}°C · 강수확률 {weather.rainProbability}%
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">날씨 불러오는 중…</div>
          )}
        </div>

        <div className="my-3 border-t border-gray-200" />

        <button
          disabled
          className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed text-left"
          title="준비 중인 기능입니다"
        >
          성적 내보내기 (준비중)
        </button>

        <button className="flex items-center gap-2 w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          <LogOut size={16} />
          로그아웃
        </button>
      </nav>

      {/* 하단 날씨 */}
    </aside>
  );
}
