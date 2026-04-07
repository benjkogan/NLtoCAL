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
    if (!el) return;
    if (!text) {
      el.style.height = "56px";
      return;
    }
    el.style.height = "0px";
    el.style.height = `${Math.max(el.scrollHeight, 56)}px`;
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

  const canSubmit = !!text.trim() && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='"2 hour lunch with Sarah Friday at noon" or "Cancel my 3pm meeting"'
          autoCapitalize="sentences"
          rows={1}
          className="w-full resize-none rounded-lg px-4 pr-14 text-base overflow-hidden focus:outline-none flex items-center"
          style={{
            ...{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              transition: "height 0.15s ease, border-color 0.15s ease",
              paddingTop: "16px",
              paddingBottom: "16px",
            },
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
          disabled={isLoading}
        />
        {isLoading ? (
          <div
            className="absolute top-1/2 -translate-y-1/2 right-2.5 h-8 rounded-md flex items-center gap-2 px-3 animate-pulse"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "var(--bg)", borderRightColor: "var(--bg)" }}
            />
            <span className="text-xs font-medium">Parsing</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className="absolute top-1/2 -translate-y-1/2 right-2.5 h-8 w-8 rounded-md flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canSubmit ? "var(--accent)" : "var(--bg-hover)",
              color: "var(--bg)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
