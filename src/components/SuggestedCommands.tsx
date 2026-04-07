"use client";

const suggestions = [
  "Lunch tomorrow at noon",
  "Cancel my 3pm meeting",
  "Move standup to 10am",
  "Coffee with alice@example.com Friday",
];

interface SuggestedCommandsProps {
  onSelect: (text: string) => void;
}

export default function SuggestedCommands({ onSelect }: SuggestedCommandsProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full justify-center px-4 sm:px-0">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="rounded-full px-3.5 py-1.5 text-sm transition-colors"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-tertiary)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--bg-raised)";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
