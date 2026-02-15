"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { WaitlistResponse } from "@/lib/types";
import { AsciiBorder } from "@/components/ascii-border";
import { AsciiWaveform } from "@/components/ascii-waveform";

export function Landing(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        const data: WaitlistResponse = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "something went wrong");
      }
    });
  }

  return (
    <>
      <header className="mb-12">
        <h1 className="sr-only">v0x — push-to-talk voice assistant for macOS</h1>
        <pre
          className="animate-in overflow-x-auto leading-none ascii-title text-[var(--text-white)]"
          aria-hidden="true"
        >{`██╗   ██╗ ██████╗ ██╗  ██╗
██║   ██║██╔═══██╗╚██╗██╔╝
██║   ██║██║   ██║ ╚███╔╝
╚██╗ ██╔╝██║   ██║ ██╔██╗
 ╚████╔╝ ╚██████╔╝██╔╝ ██╗
  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝`}</pre>
        <p className="animate-in delay-1 mt-4 text-[var(--text-muted)]">
          <span className="text-[var(--green)]">&gt;</span>{" "}
          the music is the dish, your taste is the seasoning
        </p>
        <p className="animate-in delay-2 mt-2 text-[var(--text-muted)]">
          push-to-talk voice assistant for macOS. say it, hear it, feel it.
        </p>
      </header>

      {status ? (
        <div className="animate-in mb-10">
          <AsciiBorder>
            <div className="text-[var(--green)]">
              {status.duplicate ? "already on the list" : "you're on the list"}
            </div>
            {!status.duplicate && (
              <div className="mt-1 text-[var(--text-muted)]">
                we&apos;ll let you know when v0x is ready
              </div>
            )}
          </AsciiBorder>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mb-10"
          aria-label="Join the waitlist"
        >
          <label
            htmlFor="email-input"
            className="mb-2 block text-[11px] uppercase tracking-widest text-[var(--text-muted)]"
          >
            join the waitlist
          </label>
          <div className="flex gap-2">
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              required
              aria-describedby={error ? "form-error" : undefined}
              className="min-h-[44px] flex-1 border-b border-[var(--border-bright)] bg-transparent px-0 py-2 text-[var(--text-white)] transition-colors focus-visible:border-[var(--text-muted)] focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !email.trim()}
              aria-busy={pending}
              className="min-h-[44px] min-w-[44px] border border-[var(--border-bright)] px-5 py-2 text-[var(--text-bright)] transition-colors hover:border-[var(--text-muted)] hover:text-[var(--text-white)] focus-visible:border-[var(--text-muted)] focus-visible:outline-none disabled:cursor-default disabled:border-[var(--border)] disabled:text-[var(--text-muted)]"
            >
              {pending ? "..." : "join"}
            </button>
          </div>
        </form>
      )}

      {error ? (
        <div
          id="form-error"
          role="alert"
          className="animate-in mb-8 border-l-2 border-[var(--red)] py-2 pl-4 text-[var(--red)]"
        >
          {error}
        </div>
      ) : null}

      <div className="animate-in delay-3 space-y-2 text-[var(--text-muted)]">
        <p>
          <span className="text-[var(--text)]">&gt;</span>{" "}
          double-tap right cmd to talk
        </p>
        <p>
          <span className="text-[var(--text)]">&gt;</span>{" "}
          say &quot;computer&quot; for hands-free
        </p>
        <p>
          <span className="text-[var(--text)]">&gt;</span>{" "}
          voice-driven music that learns your taste
        </p>
        <p>
          <span className="text-[var(--text)]">&gt;</span>{" "}
          runs local, no cloud lock-in
        </p>
      </div>

      <AsciiWaveform />
    </>
  );
}
