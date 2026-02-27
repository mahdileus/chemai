import { authUser } from "@/utils/auth-server";
import { redirect } from "next/navigation";
import Sidebar from "../module/p-admin/Sidebar";
import Topbar from "../module/p-admin/Topbar";

export default async function AdminDashboardLayout({ children }) {
  const user = await authUser();

  if (user) {
    if (user.role !== "ADMIN") {
      return redirect("/p-user");
    }
  } else {
    return redirect("/login-register");
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 font-yekan-bakh text-white">
      {/* glow background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}