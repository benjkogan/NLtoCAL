"use client";

export default function Privacy() {
  return (
    <div className="w-full max-w-2xl pt-4 sm:pt-8 pb-16 sm:pb-24">
      <h1
        className="text-2xl sm:text-3xl font-medium tracking-tight mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Privacy Policy
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-tertiary)" }}>
        Last updated: March 19, 2026
      </p>

      <div className="space-y-8" style={{ color: "var(--text-primary)" }}>
        <section>
          <h2
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            What NLtoCal does
          </h2>
          <p>
            NLtoCal is a web application that lets you manage your Google
            Calendar using natural language. You type a request in plain
            English, and the app creates, deletes, or updates events on your
            behalf after you confirm.
          </p>
        </section>

        <section>
          <h2
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Data we access
          </h2>
          <p className="mb-3">
            When you sign in with Google, NLtoCal requests access to:
          </p>
          <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-primary)" }}>
            <li>
              <strong>Google Calendar (read and write)</strong> — to search for
              events, create new events, delete events, and update your RSVP
              status. We only access your primary calendar.
            </li>
            <li>
              <strong>Basic profile information</strong> — your name and email
              address, used solely to display your account in the app.
            </li>
          </ul>
        </section>

        <section>
          <h2
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            How your data is used
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Your natural language input is sent to Anthropic&apos;s Claude API to
              parse it into a structured calendar action. Anthropic does not
              store your inputs per their API data policy.
            </li>
            <li>
              Calendar operations (create, delete, RSVP) are executed directly
              against the Google Calendar API only after you explicitly confirm
              the action.
            </li>
            <li>
              Your Google access token and refresh token are stored in an
              encrypted session cookie. They are never saved to a database or
              shared with third parties.
            </li>
          </ul>
        </section>

        <section>
          <h2
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Data we do not collect
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We do not store your calendar events or event data.</li>
            <li>We do not store your natural language inputs.</li>
            <li>We do not use analytics or tracking cookies.</li>
            <li>We do not sell or share your data with anyone.</li>
          </ul>
        </section>

        <section>
          <h2
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Data retention
          </h2>
          <p>
            NLtoCal does not persist any user data beyond the browser session.
            Your authentication tokens exist only in your session cookie and
            are cleared when you sign out or when the session expires.
          </p>
        </section>

        <section>
          <h2
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Revoking access
          </h2>
          <p>
            You can revoke NLtoCal&apos;s access to your Google account at any time
            by visiting{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              Google Account Permissions
            </a>
            {" "}and removing NLtoCal.
          </p>
        </section>

      </div>
    </div>
  );
}
