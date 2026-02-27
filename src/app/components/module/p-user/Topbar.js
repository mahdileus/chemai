// components/dashboard/Topbar.jsx
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import { BiSolidBell } from "react-icons/bi";
import Link from "next/link";

export default async function Topbar() {
  await connectToDB();
  const user = await authUser();
  const firstName = user.firstName
  const lastName = user.lastName
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
      <h2 className="hidden md:block text-gray-600 text-sm md:text-base"><span className="font-bold text-primary">{firstName} {lastName}</span> عزیز به وبسایت خودت خوش اومدی.</h2>
      <Link href="/" className="block md:hidden">
        <div>
          <img src="/images/chemai-multi.png" width={110} />
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <BiSolidBell className="w-6 h-6 text-primary" />
        <div>
          <img
            src="/images/cn.png"
            className="w-10 h-10"
          />
        </div>
      </div>
    </header>
  );
}
