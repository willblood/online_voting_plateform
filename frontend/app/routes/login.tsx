import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login — AGORA Election Platform" },
    { name: "description", content: "Sign in to access the election management command center." },
  ];
}

const C = {
  void: "#03030c",
  base: "#07071a",
  surface: "#0d0d24",
  elevated: "#13132e",
  border: "#1e1e48",
  borderMid: "#2a2a60",
  gold: "#c8a84b",
  goldBright: "#e8c86a",
  goldDim: "rgba(200,168,75,0.10)",
  text: "#f0f0fc",
  textDim: "#9090c0",
  textMuted: "#404078",
  teal: "#00d4a0",
  red: "#ff3d5c",
  redDim: "rgba(255,61,92,0.12)",
};
const F = {
  display: '"Cormorant Garamond", Georgia, serif',
  mono: '"DM Mono", monospace',
  ui: '"Sora", system-ui, sans-serif',
};

// ── Hex grid background pattern ────────────────────────────────────────────────
function HexPattern() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="hex"
          x="0"
          y="0"
          width="56"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points="14,2 42,2 56,24 42,46 14,46 0,24"
            fill="none"
            stroke={C.gold}
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

// ── Form field component ───────────────────────────────────────────────────────
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label
        style={{
          fontFamily: F.mono,
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: focused ? C.gold : C.textMuted,
          transition: "color 0.15s",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: focused ? C.elevated : C.surface,
          border: `1px solid ${focused ? C.gold : C.border}`,
          color: C.text,
          fontFamily: F.ui,
          fontSize: "0.9rem",
          outline: "none",
          transition: "background 0.15s, border-color 0.15s",
          borderRadius: 0,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

// ── Login form ─────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Login failed. Please check your credentials.");
        return;
      }

      localStorage.setItem("agora_token", data.access_token);
      localStorage.setItem("agora_user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: F.ui,
        background: C.void,
      }}
    >
      {/* ── Left panel ── */}
      <div
        style={{
          flex: "0 0 42%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          background: C.base,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Hex pattern bg */}
        <HexPattern />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-20%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,168,75,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: C.gold,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: "15px",
              color: C.void,
              flexShrink: 0,
            }}
          >
            A
          </div>
          <span
            style={{
              fontFamily: F.display,
              fontSize: "1.4rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: C.text,
            }}
          >
            AGO<span style={{ color: C.gold }}>RA</span>
          </span>
        </Link>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: "1.5rem",
            }}
          >
            Command Center
          </div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.15,
              color: C.text,
              margin: "0 0 2rem",
            }}
          >
            The ballot is
            <br />
            stronger than
            <br />
            <strong style={{ fontStyle: "normal", fontWeight: 700, color: C.gold }}>
              the bullet.
            </strong>
          </h1>
          <p
            style={{
              fontFamily: F.mono,
              fontSize: "0.65rem",
              color: C.textMuted,
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            — Abraham Lincoln
          </p>
        </div>

        {/* Bottom info */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              gap: "1px",
              background: C.border,
              border: `1px solid ${C.border}`,
            }}
          >
            {[
              { val: "3", label: "Active Elections" },
              { val: "22", label: "Districts" },
              { val: "847", label: "Municipalities" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: C.surface,
                  padding: "0.875rem 1rem",
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: C.text,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: "0.58rem",
                    color: C.textMuted,
                    letterSpacing: "0.06em",
                    marginTop: "2px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
          background: C.void,
          position: "relative",
        }}
      >
        {/* Subtle top glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            height: "300px",
            background: "radial-gradient(ellipse at top, rgba(200,168,75,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>
          {/* Top accent line */}
          <div
            style={{
              height: "2px",
              background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
              marginBottom: "2.5rem",
            }}
          />

          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: F.display,
                fontSize: "2rem",
                fontWeight: 500,
                color: C.text,
                margin: "0 0 0.5rem",
                letterSpacing: "-0.01em",
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: C.textDim,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Sign in to access the election management command center.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: C.redDim,
                border: `1px solid rgba(255,61,92,0.3)`,
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0, marginTop: "1px" }}
              >
                <circle cx="8" cy="8" r="7" stroke={C.red} strokeWidth="1.5" />
                <path d="M8 5v3.5M8 11v.5" stroke={C.red} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: "0.78rem", color: C.red, lineHeight: 1.5 }}>
                {error}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@agora.gov"
              autoComplete="email"
              disabled={loading}
            />

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={loading}
            />

            {/* Options row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: C.textDim,
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: "14px",
                    height: "14px",
                    accentColor: C.gold,
                    cursor: "pointer",
                  }}
                />
                Keep me signed in
              </label>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: F.ui,
                  fontSize: "0.75rem",
                  color: C.textMuted,
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.gold)}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textMuted)}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                padding: "14px 24px",
                background:
                  loading || !email || !password ? C.goldDim : C.gold,
                border: `1px solid ${loading || !email || !password ? C.border : C.gold}`,
                color: loading || !email || !password ? C.textMuted : C.void,
                fontFamily: F.ui,
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                transition: "background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                if (!btn.disabled) {
                  btn.style.background = C.goldBright;
                  btn.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                if (!btn.disabled) {
                  btn.style.background = C.gold;
                  btn.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ animation: "spin-slow 1s linear infinite" }}
                  >
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
                    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>
                  Enter Platform
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "2rem 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: C.border }} />
            <span style={{ fontFamily: F.mono, fontSize: "0.58rem", color: C.textMuted, letterSpacing: "0.1em" }}>
              SECURE ACCESS
            </span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
          </div>

          {/* Security badges */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {["JWT Protected", "bcrypt Hashed", "Role-Based"].map((badge) => (
              <span
                key={badge}
                style={{
                  padding: "4px 10px",
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  fontFamily: F.mono,
                  fontSize: "0.58rem",
                  letterSpacing: "0.08em",
                  color: C.textMuted,
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Back link */}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              to="/"
              style={{
                fontFamily: F.mono,
                fontSize: "0.65rem",
                color: C.textMuted,
                textDecoration: "none",
                letterSpacing: "0.06em",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.textDim)}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textMuted)}
            >
              ← Back to landing page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
