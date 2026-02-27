"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({ icon, label, href, onClick }) {
  const pathname = usePathname();
  const isActive = href && pathname === href;

  // اگر onClick وجود داشته باشد → دکمه معمولی (غیر لینک)
  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 md:px-3 md:bg-[#e6f0ff] md:py-2 rounded-full transition-all cursor-pointer 
          hover:bg-primary hover:text-white text-primary`}
      >
        <span className="text-xl text-white bg-primary rounded-full p-1 ">{icon}</span>
        <span className="hidden md:block">{label}</span>
      </div>
    );
  }

  // حالت لینک (عادی)
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 md:px-3 md:py-2 md:bg-[#e6f0ff] rounded-xl md:rounded-full transition-all cursor-pointer 
        hover:bg-primary hover:text-white ${isActive ? " md:bg-primary text-primary md:text-white font-bold w-full" : "text-gray-700"
        }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-2">
        <span className="text-xl text-primary md:text-white md:bg-primary rounded-full p-1  ">{icon}</span>
        <span className="block text-center">{label}</span>
      </div>

    </Link>
  );
}
