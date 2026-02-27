"use client"
import { CiShoppingBasket, CiHeadphones, CiUser, CiLogout, CiCreditCard1 } from "react-icons/ci";

import SidebarItem from "./SidebarItem";
import Link from "next/link";
import swal from "sweetalert";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  const logoutHandler = () => {
    swal({
      title: "آیا از خروج اطمینان دارید؟",
      icon: "warning",
      buttons: ["نه", "آره"],
    }).then(async (result) => {
      if (result) {
        const res = await fetch("/api/auth/signout", {
          method: "POST",
        });

        if (res.status === 200) {
          swal({
            title: "با موفقیت از اکانت خارج شدین",
            icon: "success",
            buttons: "فهمیدم",
          }).then((result) => {
            router.replace("/");
          });
        }
      }
    });
  };
  return (
    <aside className="w-20 md:w-64 bg-white p-4 flex flex-col items-center gap-4 border-l  border-gray-200">
      <Link href="/" className="hidden md:block" >
        <div>
          <img src="/images/chemai-multi.png" width={110} />
        </div>
      </Link>

      <nav className="flex flex-col justify-between rounded-t-full h-full w-full text-sm mt-12 text-cream">
        <div className="flex flex-col gap-4">
          <SidebarItem icon={<CiUser className="w-6 h-6" />} label="داشبورد " href="/p-user/dashboard" />
          <SidebarItem icon={<CiShoppingBasket className="w-6 h-6" />} label=" محصولات من " href="/p-user/listings" />
          <SidebarItem icon={<CiShoppingBasket className="w-6 h-6" />} label=" کارتابل خرید " href="/p-user/shopping-cart" />
          <SidebarItem icon={<CiShoppingBasket className="w-6 h-6" />} label="کارتابل فروش" href="/p-user/sales-cart" />
          <SidebarItem icon={<CiCreditCard1 className="w-6 h-6" />} label="امور مالی" href="/p-user/financial-affairs" />

          <SidebarItem icon={<CiHeadphones className="w-6 h-6" />} label="پشتیبانی" href="/p-user/tickets" />
        </div>
        <div className="flex flex-col gap-4">
          <div onClick={logoutHandler}>
            <SidebarItem
              icon={<CiLogout className="w-6 h-6" />}
              label="خروج"
              onClick={logoutHandler}
            />
          </div>
        </div>
      </nav>
    </aside>
  );
}
