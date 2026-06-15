"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Magic-link login. Submitting an email asks Supabase to send a one-time sign-in
// link that redirects back through /auth/callback.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <div className="pageHeader">
        <div>
          <h1>Sign in</h1>
          <p>We&apos;ll email you a magic link — no password needed.</p>
        </div>
      </div>

      {status === "sent" ? (
        <div className="card">
          <div className="cardTitle">Check your email</div>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            A sign-in link is on its way to <strong>{email}</strong>. Click it to
            finish signing in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <div className="field">
            <label htmlFor="email">NC State email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@ncsu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {status === "error" && (
            <p className="badge badge-red" style={{ marginBottom: "0.9rem" }}>
              {error}
            </p>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}
    </div>
  );
}
