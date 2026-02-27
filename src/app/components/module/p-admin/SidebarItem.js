"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarItem({
  icon,
  label,
  href,
  onClick,
  className = "",
  exact = true,
  variant = "default", // "default" | "danger"
}) {
  const pathname = usePathname();

  const isActive = href
    ? exact
      ? pathname === href
      : pathname?.startsWith(href)
    : false;

  const baseClasses =
    "group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all";

  const variants = {
    default: isActive
      ? "border-primary/40 bg-primary/20 text-white shadow-lg shadow-primary/10"
      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white",
    danger:
      "border-red-300/20 bg-red-400/5 text-red-100 hover:bg-red-400/10",
  };

  const iconBox =
    variant === "danger"
      ? "bg-red-400/10 text-red-100"
      : isActive
      ? "bg-primary/30 text-white"
      : "bg-white/5 text-white/80 group-hover:bg-white/10 group-hover:text-white";

  const content = (
    <>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${iconBox}`}>
        <span className="flex items-center justify-center">{icon}</span>
      </span>

      <span className="hidden md:inline truncate">{label}</span>
      <span className="ml-auto inline-block h-2 w-2 rounded-full bg-current opacity-80 md:hidden" />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={label}
        className={`${baseClasses} ${variants[variant]} ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} title={label} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {content}
    </Link>
  );
}