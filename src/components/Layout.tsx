import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-white overflow-y-auto">{children}</main>
    </div>
  );
}
