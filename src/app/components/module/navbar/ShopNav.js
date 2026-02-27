"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "صفحه اصلی", path: "/" },
  { name: "بازارگاه", path: "/shop" },
  { name: "پلن ها", path: "/plans" },
  { name: "اخبار", path: "#" },
  { name: "درباره ما", path: "#" },
  { name: "تماس با ما", path: "/contact-us" },
];

export default function ShopNav() {
  const pathName = usePathname();

  return (
    <nav className="hidden lg:flex items-center justify-center gap-6 font-yekan-bakh text-black/80 text-base lg:text-lg pt-4">
      {links.map(({ name, path }, index) => {
        const isActive = path === pathName;
        return (
          <Link
            key={index}
            href={path}
            className={`
              px-3 py-1 font-medium transition-all duration-200 
              hover:text-black hover:scale-105
              ${isActive ? "text-black border-b-2 border-secondery scale-105" : ""}
            `}
          >
            {name}
          </Link>
        );
      })}
    </nav>
  );
}
