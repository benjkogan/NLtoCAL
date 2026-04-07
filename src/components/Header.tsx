"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default function Header() {
  const pathname = usePathname();

  function navStyle(href: string) {
    const isActive = pathname === href;
    return {
      color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
      borderBottom: isActive ? "1px solid var(--text-secondary)" : "1px solid transparent",
      paddingBottom: "2px",
    };
  }

  return (
    <header className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-y-3 py-6 sm:py-8">
      <Link
        href="/"
        className="text-xl sm:text-2xl font-semibold tracking-wide transition-colors"
        style={{ color: "var(--text-primary)" }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
      >
        NLtoCal
      </Link>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="text-sm sm:text-base transition-colors"
          style={navStyle("/")}
          onMouseOver={(e) => { if (pathname !== "/") e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseOut={(e) => { if (pathname !== "/") e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          Home
        </Link>
        <Link
          href="/about"
          className="text-sm sm:text-base transition-colors"
          style={navStyle("/about")}
          onMouseOver={(e) => { if (pathname !== "/about") e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseOut={(e) => { if (pathname !== "/about") e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          About
        </Link>
        <Link
          href="/privacy"
          className="text-sm sm:text-base transition-colors hidden sm:inline"
          style={navStyle("/privacy")}
          onMouseOver={(e) => { if (pathname !== "/privacy") e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseOut={(e) => { if (pathname !== "/privacy") e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          Privacy
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
