"use client";

export default function About() {
  return (
    <div className="w-full max-w-2xl sm:max-w-4xl flex-1 min-h-0 overflow-y-auto no-scrollbar pt-6 sm:pt-8 pb-8 sm:pb-10">
      <h1
        className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        About
      </h1>

      <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
        {/* Left column */}
        <div className="space-y-5 sm:space-y-6">
          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              What it is
            </h2>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              NL2Cal lets you manage your Google Calendar using plain English.
              Instead of clicking through forms, just type what you want —
              create events, cancel meetings, or change your RSVP status in
              seconds.
            </p>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              How it works
            </h2>
            <ol
              className="space-y-2 list-decimal list-inside text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <li>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  You type naturally.
                </span>{" "}
                Write something like &ldquo;2 hour lunch with Sarah Friday at noon&rdquo;
                or &ldquo;cancel my 3pm meeting tomorrow.&rdquo;
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  AI parses your intent.
                </span>{" "}
                Your input is sent to Claude, which extracts the action, event
                details, dates, and times into structured data.
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  You confirm before anything happens.
                </span>{" "}
                For new events, you see a preview with the option to edit
                details. For deletions and RSVPs, you pick from matching events
                on your calendar.
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  It hits your Google Calendar.
                </span>{" "}
                Once confirmed, the action is executed via the Google Calendar
                API. The event is created, deleted, or updated instantly.
              </li>
            </ol>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Why it exists
            </h2>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              Adding a calendar event should be as fast as telling someone about
              it. But Google Calendar&apos;s UI makes you click through date pickers,
              time selectors, and form fields for something you could say in one
              sentence. NL2Cal closes that gap — you describe what&apos;s happening,
              and it just works.
            </p>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5 sm:space-y-6">
          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Examples
            </h2>
            <div className="space-y-1.5">
              {[
                "2 hour lunch with Sarah next Friday at noon",
                "Cancel my 3pm meeting tomorrow",
                "Decline the team standup on Monday",
                "30 min call with Alex Wednesday at 10am",
                "Accept the design review on Thursday",
              ].map((example) => (
                <div
                  key={example}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  &ldquo;{example}&rdquo;
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Privacy
            </h2>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              NL2Cal only accesses your Google Calendar when you explicitly
              confirm an action. Your input text is sent to Claude for parsing
              but is not stored. Calendar tokens are kept in your session and
              never saved to a database.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
