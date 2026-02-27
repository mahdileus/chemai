"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import swal from "sweetalert";
import { usePathname, useRouter } from "next/navigation";
import {
  CiShoppingBasket,
  CiHeadphones,
  CiUser,
  CiLogout,
  CiCreditCard1,
  CiCircleChevDown,
  CiCircleChevUp,
  CiChat1,
  
  CiGrid41,
} from "react-icons/ci";

import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  const productSubmenu = useMemo(
    () => [
      { label: "افزودن دسته‌بندی", href: "/p-admin/products/categories" },
      { label: "افزودن گرید", href: "/p-admin/products/grades" },
      { label: "افزودن فارماکوپه", href: "/p-admin/products/pharmacopeias" },
      { label: "افزودن بسته‌بندی", href: "/p-admin/products/packaging-types" },
      { label: "افزودن شرکت سازنده", href: "/p-admin/products/manufacturer" },
      { label: "افزودن کشور", href: "/p-admin/products/countries" },
      { label: "افزودن فرم", href: "/p-admin/products/forms" },
      { label: " محصولات", href: "/p-admin/products" },
    ],
    []
  );

  const isInProductsMenu = productSubmenu.some((item) => path?.startsWith(item.href));
  const [isProductsOpen, setIsProductsOpen] = useState(isInProductsMenu);

  useEffect(() => {
    if (isInProductsMenu) setIsProductsOpen(true);
  }, [isInProductsMenu]);

  const logoutHandler = () => {
    swal({
      title: "آیا از خروج اطمینان دارید؟",
      icon: "warning",
      buttons: ["نه", "آره"],
    }).then(async (result) => {
      if (!result) return;

      try {
        const res = await fetch("/api/auth/signout", { method: "POST" });

        if (res.status === 200) {
          swal({
            title: "با موفقیت از اکانت خارج شدین",
            icon: "success",
            buttons: "فهمیدم",
          }).then(() => {
            router.replace("/");
          });
        } else {
          swal({
            title: "خروج انجام نشد",
            icon: "error",
            buttons: "باشه",
          });
        }
      } catch {
        swal({
          title: "خطا در ارتباط با سرور",
          icon: "error",
          buttons: "باشه",
        });
      }
    });
  };

  return (
    <aside className="h-screen w-20 shrink-0 border-l border-white/10 bg-white/5 p-2.5 backdrop-blur-xl md:w-72 md:p-4">
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-2xl">
        {/* glow / gradients */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" />
        <div className="pointer-events-none absolute -top-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-white/10 p-3 md:p-4">
            <Link
              href="/"
              className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
            >
              <img
                src="/images/logo-white-2.png"
                width={110}
                alt="chemai"
                className="hidden md:block"
              />
              <div className="text-sm font-bold text-white md:hidden">CH</div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex min-h-0 flex-1 flex-col justify-between p-2">
            {/* Top */}
            <div className="min-h-0 space-y-2 overflow-y-auto pr-0.5">
              <div className="mb-1 hidden items-center gap-2 px-2 text-xs text-white/60 md:flex">
                <CiGrid41 size={15} />
                <span>مدیریت پنل</span>
              </div>

              <SidebarItem
                icon={<CiUser className="h-5 w-5" />}
                label="داشبورد"
                href="/p-admin/dashboard"
                exact
              />

              {/* Products Accordion */}
              <div className="rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  onClick={() => setIsProductsOpen((prev) => !prev)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                    isInProductsMenu || isProductsOpen
                      ? "text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        isInProductsMenu || isProductsOpen
                          ? "bg-primary/25 text-white"
                          : "bg-white/5 text-white/80"
                      }`}
                    >
                      <CiShoppingBasket className="h-5 w-5" />
                    </span>

                    <span className="hidden truncate md:inline">محصولات</span>
                  </div>

                  <span className="hidden text-white/80 md:inline">
                    {isProductsOpen ? (
                      <CiCircleChevUp className="h-5 w-5" />
                    ) : (
                      <CiCircleChevDown className="h-5 w-5" />
                    )}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isProductsOpen ? "max-h-[700px] pb-2" : "max-h-0"
                  }`}
                >
                  <div className="mx-2 space-y-1 border-r border-white/10 pr-2 md:mr-3">
                    {productSubmenu.map((item) => {
                      const isActive = path === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition md:text-sm ${
                            isActive
                              ? "border border-primary/40 bg-primary/20 text-white"
                              : "text-white/75 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="hidden truncate md:inline">{item.label}</span>
                          <span className="inline-block h-2 w-2 rounded-full bg-current md:hidden" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <SidebarItem
                icon={<CiUser className="h-5 w-5" />}
                label="لیست کاربران"
                href="/p-admin/users"
                exact={false}
              />

              <SidebarItem
                icon={<CiChat1 className="h-5 w-5" />}
                label="چت پشتیبانی"
                href="/p-admin/support-chat"
                exact={false}
              />

              <SidebarItem
                icon={<CiCreditCard1 className="h-5 w-5" />}
                label="امور مالی"
                href="/p-admin/financial-affairs"
                exact={false}
              />

              <SidebarItem
                icon={<CiHeadphones className="h-5 w-5" />}
                label="پشتیبانی"
                href="/p-admin/tickets"
                exact={false}
              />
            </div>

            {/* Bottom */}
            <div className="mt-2 border-t border-white/10 pt-2">
              <SidebarItem
                icon={<CiLogout className="h-5 w-5" />}
                label="خروج"
                onClick={logoutHandler}
                variant="danger"
              />
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
}