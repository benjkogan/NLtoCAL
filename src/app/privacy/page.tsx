"use client";

export default function Privacy() {
  return (
    <div className="w-full max-w-2xl sm:max-w-4xl flex-1 min-h-0 overflow-y-auto no-scrollbar pt-4 sm:pt-6 pb-4 sm:pb-6">
      <h1
        className="text-2xl sm:text-3xl font-medium tracking-tight mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        Privacy Policy
      </h1>
      <p className="mb-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
        Last updated: March 19, 2026
      </p>

      <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5 text-sm" style={{ color: "var(--text-primary)" }}>
        {/* Left column */}
        <div className="space-y-5">
          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              What NL2Cal does
            </h2>
            <p>
              NL2Cal lets you manage Google Calendar using natural language.
              Type a request in plain English and the app creates, deletes, or
              updates events after you confirm.
            </p>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              How your data is used
            </h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                Your input is sent to Anthropic&apos;s Claude API to parse it into a
                calendar action. Anthropic does not store inputs per their API policy.
              </li>
              <li>
                Calendar operations are executed via Google Calendar API only
                after you explicitly confirm.
              </li>
              <li>
                Your access and refresh tokens are stored in an encrypted session
                cookie — never in a database or shared with third parties.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Data retention
            </h2>
            <p>
              NL2Cal does not persist any user data beyond the browser session.
              Tokens are cleared when you sign out or the session expires.
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
              Data we access
            </h2>
            <p className="mb-2">When you sign in with Google, NL2Cal requests:</p>
            <ul className="list-disc list-inside space-y-1.5" style={{ color: "var(--text-primary)" }}>
              <li>
                <strong>Google Calendar (read and write)</strong> — to search,
                create, delete events, and update RSVP status on your primary
                calendar.
              </li>
              <li>
                <strong>Basic profile info</strong> — your name and email,
                used only to display your account in the app.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Data we do not collect
            </h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>We do not store your calendar events or event data.</li>
              <li>We do not store your natural language inputs.</li>
              <li>We do not use analytics or tracking cookies.</li>
              <li>We do not sell or share your data with anyone.</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-sm font-medium uppercase tracking-widest mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Revoking access
            </h2>
            <p>
              Revoke NL2Cal&apos;s access at any time via{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "var(--accent)" }}
              >
                Google Account Permissions
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
