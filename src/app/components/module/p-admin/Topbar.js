// components/dashboard/Topbar.jsx
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import { BiSolidBell } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";

function getInitials(firstName = "", lastName = "") {
  const f = String(firstName || "").trim();
  const l = String(lastName || "").trim();
  return `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase() || "U";
}

export default async function Topbar() {
  await connectToDB();
  const user = await authUser();

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "کاربر";
  const initials = getInitials(firstName, lastName);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl md:px-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-2xl">
        {/* glow layers */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
        <div className="pointer-events-none absolute -top-8 right-10 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-3 p-3 md:p-4">
          {/* Left / Welcome */}
          <div className="min-w-0 flex-1">
            {/* Mobile logo */}
            <Link href="/" className="inline-flex md:hidden items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
              <img src="/images/chemai-multi.png" width={95} alt="chemai" />
            </Link>

            {/* Desktop welcome text */}
            <div className="hidden md:block">
              <p className="text-sm text-white/80">
                <span className="font-bold text-white">{fullName}</span>
                <span className="mx-1">عزیز،</span>
                به وبسایت خودت خوش اومدی 👋
              </p>
              <p className="mt-1 text-xs text-white/55">
                مدیریت پنل ادمین را از اینجا ادامه بده.
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search (desktop only, optional visual) */}
            <button
              type="button"
              className="hidden md:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
              title="جستجو"
            >
              <CiSearch className="h-4 w-4" />
              <span>جستجو</span>
            </button>

            {/* Notification */}
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              title="اعلان‌ها"
            >
              <BiSolidBell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white/20 bg-primary px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 pr-2">
              <div className="hidden md:block text-right">
                <p className="max-w-[120px] truncate text-xs font-medium text-white">
                  {fullName}
                </p>
                <p className="text-[10px] text-white/55">مدیر پنل</p>
              </div>

              {/* اگر بعداً avatar واقعی داشتی، src رو از user.avatar بگیر */}
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/20 bg-primary/20">
                {/* تصویر پیش‌فرض */}
                <img
                  src="/images/cn.png"
                  alt={fullName}
                  className="h-full w-full object-cover"
                />

                {/* fallback initials (اگر تصویر لود نشد می‌تونی بعداً onError بذاری) */}
                <div className="absolute inset-0 hidden items-center justify-center bg-primary/30 text-sm font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}