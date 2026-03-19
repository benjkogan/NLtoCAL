"use client";

import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function Header() {
  return (
    <header className="flex w-full max-w-2xl items-center justify-between py-8">
      <Link
        href="/"
        className="text-2xl font-semibold tracking-wide transition-colors"
        style={{ color: "var(--text-primary)" }}
        onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
      >
        NLtoCal
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-base underline transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          Home
        </Link>
        <Link
          href="/about"
          className="text-base underline transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          About
        </Link>
        <Link
          href="/privacy"
          className="text-base underline transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          Privacy
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
