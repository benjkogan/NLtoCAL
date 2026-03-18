"use client";

import { useState, useRef, useEffect } from "react";

interface NLInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function NLInput({ onSubmit, isLoading }: NLInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "0px";
      el.style.height = `${Math.max(el.scrollHeight, 56)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='"2 hour lunch with Sarah Friday at noon" or "Cancel my 3pm meeting"'
          rows={1}
          className="w-full resize-none rounded-lg px-4 py-3.5 text-base overflow-hidden transition-all focus:outline-none"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            transition: "height 0.15s ease, border-color 0.15s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(237, 236, 236, 0.2)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(237, 236, 236, 0.08)")}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-full rounded-lg px-4 py-3 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
          onMouseOver={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          {isLoading ? "Parsing..." : "Go"}
        </button>
      </div>
    </form>
  );
}
