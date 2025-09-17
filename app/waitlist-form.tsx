"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  const data: { success?: boolean; duplicate?: boolean; error?: string } = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Something went wrong");
  setStatus("success");
  setMessage(data.duplicate ? "You were already on the list. We'll be in touch soon." : "You're on the list! We'll be in touch soon.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      const fallback = "Could not join waitlist";
      if (isErrorWithMessage(err)) {
        setMessage(err.message || fallback);
      } else {
        setMessage(fallback);
      }
    }
  }

  function isErrorWithMessage(e: unknown): e is { message: string } {
    return typeof e === "object" && e !== null && "message" in e && typeof (e as { message?: unknown }).message === "string";
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" aria-labelledby="waitlist-label">
      <label id="waitlist-label" className="sr-only">Email address</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          aria-label="Email address"
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
            disabled={status === "loading" || status === "success"}
          className="rounded-xl px-6 py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {status === "loading" ? "Joining..." : status === "success" ? "Joined" : "Join"}
        </button>
      </div>
      <div className="min-h-[20px] text-sm" aria-live="polite" role="status">
        {status === "error" && (
          <p className="text-red-600">{message || "Error. Please try again."}</p>
        )}
        {status === "success" && (
          <p className="text-green-600">{message}</p>
        )}
      </div>
    </form>
  );
}
