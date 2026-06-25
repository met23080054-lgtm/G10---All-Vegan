"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Star, Gamepad2, MoreHorizontal } from "lucide-react";
import clsx from "clsx";
import { useLang } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const navItems = [
    { href: "/", key: "nav.home", icon: Home },
    { href: "/menu", key: "nav.menu", icon: UtensilsCrossed },
    { href: "/loyalty", key: "nav.rewards", icon: Star },
    { href: "/game", key: "nav.game", icon: Gamepad2 },
    { href: "/profile", key: "nav.more", icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={clsx("p-1.5 rounded-xl transition-all", active && "bg-primary-50")}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={clsx("text-[10px] font-medium", active ? "text-primary-600" : "text-gray-400")}>
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
