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
          className="rounded-full px-3.5 py-1.5 text-sm transition-colors bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] active:bg-[var(--bg-hover)] active:text-[var(--text-secondary)]"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
