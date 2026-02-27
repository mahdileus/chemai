"use client"
import React from 'react'



import Link from 'next/link'
import { usePathname } from 'next/navigation'


const links = [
  { name: "صفحه اصلی", path: "/" },
  { name: "بازارگاه", path: "/shop" },
  { name: "پلن ها", path: "/plans" },
  { name: "اخبار", path: "#" },
  { name: "درباره ما", path: "#" },
  { name: "تماس با ما", path: "/contact-us" },
];



function MobileNav() {
    const pathName = usePathname()
    return (
        <nav className='flex flex-col font-yekan-bakh items-start gap-y-5 text-primary text-base font-dana pt-4'>
            {links.map((link, index) => {
                return <Link href={link.path} key={index} className={`${link.path === pathName && "text-secondery"
                    } font-medium hover:text-secondery transition-all`}>
                    {link.name}
                </Link>
            })}
        </nav>
    )
}

export default MobileNav;