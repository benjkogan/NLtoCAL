"use client";

export default function About() {
  return (
    <div className="w-full max-w-2xl sm:max-w-4xl flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4 sm:pt-6 pb-4 sm:pb-6">
      <h1
        className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        About
      </h1>

      <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5">
        {/* Left column */}
        <div className="space-y-5">
          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              What it is
            </h2>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              NL2Cal lets you manage your Google Calendar with plain English.
              Type what you want — create events, cancel meetings, or RSVP in seconds.
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
              className="space-y-1.5 list-decimal list-inside text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <li>
                <span className="font-medium">You type naturally.</span>{" "}
                &ldquo;Lunch with Sarah Friday at noon&rdquo; or &ldquo;Cancel my 3pm tomorrow.&rdquo;
              </li>
              <li>
                <span className="font-medium">Claude parses your input.</span>{" "}
                It extracts the action, title, dates, and times.
              </li>
              <li>
                <span className="font-medium">You confirm.</span>{" "}
                Preview or pick the matching event before anything changes.
              </li>
              <li>
                <span className="font-medium">Your calendar is updated.</span>{" "}
                The event is created, deleted, or RSVPed instantly.
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
              Google Calendar makes you click through date pickers and form
              fields for something you could say in one sentence. NL2Cal
              closes that gap.
            </p>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
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
              NL2Cal only accesses your calendar when you confirm an action.
              Your input isn&apos;t stored. Tokens live in your session cookie and
              are cleared on sign-out.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
