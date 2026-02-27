import Topbar from "../module/p-user/Topbar";
import Sidebar from "../module/p-user/Sidebar";

export default function UserDashboardLayout({ children }) {
  return (
    <div className="flex h-screen text-primary font-yekan-bakh">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}