"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default function Header() {
  const pathname = usePathname();

  function navClass(href: string) {
    const isActive = pathname === href;
    return isActive
      ? "text-[var(--text-primary)] border-b border-[var(--text-secondary)] pb-0.5"
      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] active:text-[var(--text-secondary)] border-b border-transparent pb-0.5";
  }

  return (
    <header className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-y-3 py-4 sm:py-8">
      <Link
        href="/"
        className="text-xl sm:text-2xl font-medium tracking-tight transition-colors text-[var(--text-primary)] hover:text-[var(--text-secondary)] active:text-[var(--text-secondary)]"
      >
        NL2Cal
      </Link>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className={`text-sm sm:text-base transition-colors ${navClass("/")}`}
        >
          Home
        </Link>
        <Link
          href="/about"
          className={`text-sm sm:text-base transition-colors ${navClass("/about")}`}
        >
          About
        </Link>
        <Link
          href="/privacy"
          className={`text-sm sm:text-base transition-colors ${navClass("/privacy")}`}
        >
          Privacy
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
